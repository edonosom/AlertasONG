import { Pipe, PipeTransform } from '@angular/core';

/** Proceso de ingreso del NNA; los procesos de intervención van del 1 al 5. */
export const FASE_DIAGNOSTICO = 0;

@Pipe({
  name: 'nombreFase',
  standalone: true
})
export class NombreFasePipe implements PipeTransform {
  transform(ciclo: number | null | undefined): string {
    const numero = ciclo ?? FASE_DIAGNOSTICO;
    return numero === FASE_DIAGNOSTICO ? 'Informe Diagnóstico' : `${numero} Informe de proceso`;
  }
}
