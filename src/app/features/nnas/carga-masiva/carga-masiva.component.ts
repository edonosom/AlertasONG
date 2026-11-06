import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { forkJoin } from 'rxjs';
import readXlsxFile, { CellValue, Row, parseExcelDate } from 'read-excel-file';
import { CargaMasivaFila, CargaMasivaResultado, PacienteService } from '../../../core/services/nna.service';
import { Centro, CentroService } from '../../../core/services/centro.service';
import { Usuario, UsuarioService } from '../../../core/services/usuario.service';

type CampoKey =
  | 'rut' | 'nombres' | 'apellido_paterno' | 'apellido_materno'
  | 'fecha_nacimiento' | 'fecha_ingreso' | 'circular' | 'programa' | 'profesional'
  | 'adulto_nombre' | 'adulto_apellido' | 'adulto_telefono' | 'adulto_parentesco';

interface Campo {
  key: CampoKey;
  label: string;
  requerido: boolean;
  ayuda?: string;
  /** Encabezados del Excel que se asocian automáticamente a este campo (ya normalizados). */
  sinonimos: string[];
}

type Paso = 'archivo' | 'columnas' | 'asociar' | 'revision' | 'resultado';

const MAX_FILAS = 1000;

/** Mayúsculas, sin tildes ni signos: "PPF 24 HRS. Punto" y "ppf 24hrs punto" quedan iguales. */
function normalizar(valor: unknown): string {
  return String(valor ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

function palabras(valor: unknown): string[] {
  return String(valor ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .split(/[^A-Z0-9]+/)
    .filter(Boolean);
}

function texto(valor: CellValue | undefined): string | null {
  if (valor === null || valor === undefined) return null;
  const t = (valor instanceof Date ? fechaIso(valor) : String(valor)).trim();
  return t === '' ? null : t;
}

function fechaIso(fecha: Date): string {
  // read-excel-file entrega las fechas en UTC
  return fecha.toISOString().substring(0, 10);
}

/** Convierte una celda de fecha a AAAA-MM-DD. Los textos se leen como fecha chilena (día/mes/año). */
function fecha(valor: CellValue | undefined): string | null {
  if (valor === null || valor === undefined || valor === '') return null;
  if (valor instanceof Date) return fechaIso(valor);
  if (typeof valor === 'number') return fechaIso(parseExcelDate(valor) as unknown as Date);

  const t = String(valor).trim();
  const dmy = t.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
  // Si no se reconoce, se envía tal cual y el backend informa el error en la fila
  return t || null;
}

@Component({
  selector: 'app-carga-masiva',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './carga-masiva.component.html',
  styleUrls: ['./carga-masiva.component.scss']
})
export class CargaMasivaComponent implements OnInit {
  private readonly pacienteService = inject(PacienteService);
  private readonly centroService = inject(CentroService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly toastCtrl = inject(ToastController);
  private readonly alertCtrl = inject(AlertController);
  private readonly router = inject(Router);

  readonly campos: Campo[] = [
    { key: 'rut', label: 'RUT', requerido: true, sinonimos: ['RUT', 'RUN', 'RUTNNA', 'RUNNNA'] },
    { key: 'nombres', label: 'Nombres', requerido: true, sinonimos: ['NOMBRES', 'NOMBRE', 'NOMBRESNNA'] },
    { key: 'apellido_paterno', label: 'Apellido paterno', requerido: true, ayuda: 'O la columna con ambos apellidos', sinonimos: ['APELLIDOPATERNO', 'APELLIDOS', 'APELLIDO', 'PATERNO'] },
    { key: 'apellido_materno', label: 'Apellido materno', requerido: false, sinonimos: ['APELLIDOMATERNO', 'MATERNO'] },
    { key: 'fecha_nacimiento', label: 'Fecha de nacimiento', requerido: true, sinonimos: ['FECHANACIMIENTO', 'FECHADENACIMIENTO', 'FNACIMIENTO', 'NACIMIENTO'] },
    { key: 'fecha_ingreso', label: 'Fecha de ingreso', requerido: false, ayuda: 'Con ella se calcula la fase actual', sinonimos: ['FECHAINGRESO', 'FECHADEINGRESO', 'INGRESO'] },
    { key: 'programa', label: 'Programa', requerido: false, ayuda: 'Si no viene, se elige uno para todo el archivo', sinonimos: ['NOMBREPROYECTO', 'PROYECTO', 'PROGRAMA', 'NOMBREPROGRAMA', 'CENTRO'] },
    { key: 'profesional', label: 'Profesional a cargo', requerido: true, sinonimos: ['PROFESIONALACARGO', 'PROFESIONAL', 'FUNCIONARIO', 'DUPLA', 'RESPONSABLE'] },
    { key: 'circular', label: 'Circular', requerido: false, sinonimos: ['CIRCULAR'] },
    { key: 'adulto_nombre', label: 'Adulto responsable: nombre', requerido: false, sinonimos: ['NOMBREADULTO', 'ADULTONOMBRE', 'NOMBREADULTORESPONSABLE'] },
    { key: 'adulto_apellido', label: 'Adulto responsable: apellido', requerido: false, sinonimos: ['APELLIDOADULTO', 'ADULTOAPELLIDO', 'APELLIDOADULTORESPONSABLE'] },
    { key: 'adulto_telefono', label: 'Adulto responsable: teléfono', requerido: false, sinonimos: ['TELEFONO', 'TELEFONOADULTO', 'FONO', 'CELULAR'] },
    { key: 'adulto_parentesco', label: 'Adulto responsable: parentesco', requerido: false, sinonimos: ['PARENTESCO'] },
  ];

  paso = signal<Paso>('archivo');
  cargandoArchivo = signal(false);
  enviando = signal(false);
  arrastrando = signal(false);

  archivoNombre = signal('');
  encabezados = signal<string[]>([]);
  /** Filas de datos del Excel junto a su número de fila en la planilla. */
  filasExcel = signal<{ numero: number; celdas: Row }[]>([]);

  mapeo = signal<Record<CampoKey, number | null>>(this.mapeoVacio());

  centros = signal<Centro[]>([]);
  funcionarios = signal<Usuario[]>([]);
  programaFijo = signal<string>('');
  asociacionProgramas = signal<Record<string, string>>({});
  asociacionProfesionales = signal<Record<string, string>>({});

  resultado = signal<CargaMasivaResultado | null>(null);
  soloErrores = signal(false);

  faltanCamposRequeridos = computed(() =>
    this.campos.filter(c => c.requerido && this.mapeo()[c.key] === null).map(c => c.label)
  );

  /** Valores distintos de una columna asociada, con cuántas filas los usan. */
  private valoresDistintos(campo: CampoKey): { valor: string; clave: string; filas: number }[] {
    const col = this.mapeo()[campo];
    if (col === null) return [];
    const conteo = new Map<string, { valor: string; filas: number }>();
    for (const f of this.filasExcel()) {
      const valor = texto(f.celdas[col]);
      if (!valor) continue;
      const clave = normalizar(valor);
      const actual = conteo.get(clave);
      conteo.set(clave, { valor: actual?.valor ?? valor, filas: (actual?.filas ?? 0) + 1 });
    }
    return [...conteo.entries()].map(([clave, v]) => ({ clave, ...v })).sort((a, b) => b.filas - a.filas);
  }

  programasExcel = computed(() => this.valoresDistintos('programa'));
  profesionalesExcel = computed(() => this.valoresDistintos('profesional'));

  asociacionesPendientes = computed(() => {
    const programas = this.mapeo().programa === null
      ? (this.programaFijo() ? 0 : 1)
      : this.programasExcel().filter(p => !this.asociacionProgramas()[p.clave]).length;
    const profesionales = this.profesionalesExcel().filter(p => !this.asociacionProfesionales()[p.clave]).length;
    return { programas, profesionales };
  });

  nombreCentro = computed(() => {
    const porId = new Map(this.centros().map(c => [c.id, c.nombre]));
    return (id?: string | null) => (id ? porId.get(id) ?? '' : '');
  });

  filasPayload = computed<CargaMasivaFila[]>(() => {
    const m = this.mapeo();
    const celda = (row: Row, campo: CampoKey) => (m[campo] === null ? undefined : row[m[campo]!]);

    return this.filasExcel().map(({ numero, celdas }) => {
      const apellido = [texto(celda(celdas, 'apellido_paterno')), texto(celda(celdas, 'apellido_materno'))]
        .filter(Boolean).join(' ');
      const programa = texto(celda(celdas, 'programa'));
      const profesional = texto(celda(celdas, 'profesional'));
      const adulto = {
        nombre: texto(celda(celdas, 'adulto_nombre')),
        apellido: texto(celda(celdas, 'adulto_apellido')),
        telefono: texto(celda(celdas, 'adulto_telefono')),
        parentesco: texto(celda(celdas, 'adulto_parentesco')),
      };

      return {
        fila: numero,
        rut: texto(celda(celdas, 'rut')),
        nombre: texto(celda(celdas, 'nombres')),
        apellido: apellido || null,
        fecha_nacimiento: fecha(celda(celdas, 'fecha_nacimiento')),
        fecha_ingreso: fecha(celda(celdas, 'fecha_ingreso')),
        circular: texto(celda(celdas, 'circular')),
        centro_id: m.programa === null
          ? this.programaFijo() || null
          : (programa ? this.asociacionProgramas()[normalizar(programa)] || null : null),
        funcionario_id: profesional ? this.asociacionProfesionales()[normalizar(profesional)] || null : null,
        adultos_responsables: Object.values(adulto).some(Boolean) ? [adulto] : [],
      };
    });
  });

  filasRevision = computed(() => {
    const res = this.resultado();
    if (!res) return [];
    const payload = new Map(this.filasPayload().map(f => [f.fila, f]));
    const filas = res.filas.map(r => ({ ...r, datos: payload.get(r.fila) }));
    return this.soloErrores() ? filas.filter(f => f.estado === 'error') : filas;
  });

  ngOnInit() {
    forkJoin({ centros: this.centroService.getCentros(), usuarios: this.usuarioService.getUsuarios() }).subscribe({
      next: ({ centros, usuarios }) => {
        this.centros.set([...centros.data].sort((a, b) => a.nombre.localeCompare(b.nombre)));
        this.funcionarios.set(
          usuarios.data
            .filter(u => u.rol === 'funcionario' && u.activo && !u.deleted_at)
            .sort((a, b) => `${a.nombre} ${a.apellido}`.localeCompare(`${b.nombre} ${b.apellido}`))
        );
      },
      error: () => this.toast('No se pudieron cargar los programas y funcionarios.', 'danger'),
    });
  }

  // ─── Paso 1: archivo ─────────────────────────────────────────

  onArchivoSeleccionado(event: Event) {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    input.value = '';
    if (archivo) this.leerArchivo(archivo);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.arrastrando.set(false);
    const archivo = event.dataTransfer?.files?.[0];
    if (archivo) this.leerArchivo(archivo);
  }

  async leerArchivo(archivo: File) {
    if (!/\.xlsx$/i.test(archivo.name)) {
      this.toast('El archivo debe ser un Excel .xlsx. Si es .xls o .csv, ábrelo en Excel y guárdalo como .xlsx.', 'warning');
      return;
    }

    this.cargandoArchivo.set(true);
    try {
      const filas = await readXlsxFile(archivo);
      const conDatos = (row: Row) => row.some(c => texto(c) !== null);
      // El encabezado es la primera fila con al menos dos celdas escritas
      const iEncabezado = filas.findIndex(row => row.filter(c => texto(c) !== null).length >= 2);
      if (iEncabezado === -1) throw new Error('No se encontró una fila de encabezados.');

      const datos = filas
        .map((celdas, i) => ({ numero: i + 1, celdas }))
        .slice(iEncabezado + 1)
        .filter(f => conDatos(f.celdas));

      if (datos.length === 0) throw new Error('El archivo no tiene filas con datos bajo los encabezados.');
      if (datos.length > MAX_FILAS) throw new Error(`El archivo tiene ${datos.length} filas; el máximo por carga es ${MAX_FILAS}.`);

      this.archivoNombre.set(archivo.name);
      this.encabezados.set(filas[iEncabezado].map((c, i) => texto(c) ?? `Columna ${i + 1}`));
      this.filasExcel.set(datos);
      this.mapeo.set(this.detectarMapeo(this.encabezados()));
      this.resultado.set(null);
      this.paso.set('columnas');
    } catch (e: any) {
      this.toast(e?.message || 'No se pudo leer el archivo.', 'danger');
    } finally {
      this.cargandoArchivo.set(false);
    }
  }

  // ─── Paso 2: columnas ────────────────────────────────────────

  private mapeoVacio(): Record<CampoKey, number | null> {
    return {
      rut: null, nombres: null, apellido_paterno: null, apellido_materno: null,
      fecha_nacimiento: null, fecha_ingreso: null, circular: null, programa: null, profesional: null,
      adulto_nombre: null, adulto_apellido: null, adulto_telefono: null, adulto_parentesco: null,
    };
  }

  private detectarMapeo(encabezados: string[]): Record<CampoKey, number | null> {
    const mapeo = this.mapeoVacio();
    const usadas = new Set<number>();
    for (const campo of this.campos) {
      // Se respeta el orden de sinónimos: el primero que aparezca gana
      for (const sinonimo of campo.sinonimos) {
        const i = encabezados.findIndex((h, idx) => !usadas.has(idx) && normalizar(h) === sinonimo);
        if (i !== -1) {
          mapeo[campo.key] = i;
          usadas.add(i);
          break;
        }
      }
    }
    return mapeo;
  }

  cambiarMapeo(campo: CampoKey, valor: string) {
    this.mapeo.update(m => ({ ...m, [campo]: valor === '' ? null : Number(valor) }));
  }

  ejemploColumna(col: number | null): string {
    if (col === null) return '';
    const valores = this.filasExcel().slice(0, 3).map(f => texto(f.celdas[col])).filter(Boolean);
    return valores.join(' · ');
  }

  irAAsociar() {
    if (this.faltanCamposRequeridos().length) return;
    this.autoAsociar();
    this.paso.set('asociar');
  }

  // ─── Paso 3: programas y profesionales ───────────────────────

  private autoAsociar() {
    const programas: Record<string, string> = {};
    for (const p of this.programasExcel()) {
      const centro = this.centros().find(c => normalizar(c.nombre) === p.clave || (c.codigo && normalizar(c.codigo) === p.clave));
      programas[p.clave] = this.asociacionProgramas()[p.clave] || centro?.id || '';
    }
    this.asociacionProgramas.set(programas);

    const profesionales: Record<string, string> = {};
    for (const p of this.profesionalesExcel()) {
      profesionales[p.clave] = this.asociacionProfesionales()[p.clave] || this.buscarFuncionario(p.valor)?.id || '';
    }
    this.asociacionProfesionales.set(profesionales);
  }

  /**
   * Los nombres no siempre vienen completos en ambos lados ("Luis Vera Vera" en el Excel y
   * "Luis Alfredo Vera Vera" en el sistema, o al revés): se asocia el funcionario cuando todas
   * las palabras de uno están en el otro, y solo si hay un único candidato.
   */
  private buscarFuncionario(valor: string): Usuario | undefined {
    const rut = normalizar(valor);
    const porRutOEmail = this.funcionarios().find(
      u => normalizar(u.rut) === rut || u.email?.toLowerCase() === valor.trim().toLowerCase()
    );
    if (porRutOEmail) return porRutOEmail;

    const delExcel = palabras(valor);
    const contenido = (a: string[], b: string[]) => a.every(t => b.includes(t));
    const candidatos = this.funcionarios().filter(u => {
      const delSistema = palabras(`${u.nombre} ${u.apellido}`);
      return Math.min(delExcel.length, delSistema.length) >= 2
        && (contenido(delExcel, delSistema) || contenido(delSistema, delExcel));
    });
    return candidatos.length === 1 ? candidatos[0] : undefined;
  }

  asociarPrograma(clave: string, centroId: string) {
    this.asociacionProgramas.update(a => ({ ...a, [clave]: centroId }));
  }

  asociarProfesional(clave: string, funcionarioId: string) {
    this.asociacionProfesionales.update(a => ({ ...a, [clave]: funcionarioId }));
  }

  // ─── Paso 4: revisión y carga ────────────────────────────────

  validar() {
    this.enviando.set(true);
    this.pacienteService.cargaMasiva(this.filasPayload(), true).subscribe({
      next: res => {
        this.enviando.set(false);
        this.resultado.set(res.data);
        this.soloErrores.set(res.data.resumen.con_error > 0);
        this.paso.set('revision');
      },
      error: err => {
        this.enviando.set(false);
        this.toast(err.error?.message || 'No se pudo validar el archivo.', 'danger');
      },
    });
  }

  async confirmarCarga() {
    const res = this.resultado();
    if (!res || res.resumen.validas === 0) return;

    const conError = res.resumen.con_error;
    const alert = await this.alertCtrl.create({
      header: 'Confirmar carga',
      message: `Se registrarán ${res.resumen.validas} NNA.` +
        (conError ? ` Las ${conError} filas con errores no se cargarán; puedes corregirlas en el Excel y subirlo de nuevo.` : ''),
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Cargar', handler: () => this.cargar() },
      ],
    });
    await alert.present();
  }

  private cargar() {
    this.enviando.set(true);
    this.pacienteService.cargaMasiva(this.filasPayload(), false).subscribe({
      next: res => {
        this.enviando.set(false);
        this.resultado.set(res.data);
        this.soloErrores.set(false);
        this.paso.set('resultado');
        this.toast(`${res.data.resumen.creadas} NNA registrados.`, 'success');
      },
      error: err => {
        this.enviando.set(false);
        this.toast(err.error?.message || 'No se pudo completar la carga.', 'danger');
      },
    });
  }

  reiniciar() {
    this.paso.set('archivo');
    this.archivoNombre.set('');
    this.encabezados.set([]);
    this.filasExcel.set([]);
    this.mapeo.set(this.mapeoVacio());
    this.programaFijo.set('');
    this.resultado.set(null);
  }

  irANnas() {
    this.router.navigate(['/nnas']);
  }

  private async toast(message: string, color: 'success' | 'danger' | 'warning') {
    const t = await this.toastCtrl.create({ message, color, duration: 4000, position: 'top' });
    await t.present();
  }
}
