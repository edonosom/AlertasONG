import { Component, OnInit, inject } from '@angular/core';
import { AdminApiService, AdminMetrics } from '../../../core/services/admin-api.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { CentroService } from '../../../core/services/centro.service';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class AdminComponent implements OnInit {
  adminApi = inject(AdminApiService);
  usuarioService = inject(UsuarioService);
  centroService = inject(CentroService);

  metrics: AdminMetrics | null = null;
  
  centros: any[] = [];
  directores: any[] = [];
  funcionarios: any[] = [];
  pacientes: any[] = [];

  // Models para el Pegamento Jerárquico
  selectedCentroId: string = '';
  selectedDirectorParaCentro: string = '';

  selectedDirectorId: string = '';
  selectedFuncionarioParaDirector: string = '';

  selectedFuncionarioId: string = '';
  selectedPacienteId: string = '';
  selectedCentroParaPaciente: string = '';

  ngOnInit() {
    this.cargarDashboard();
    this.cargarCatalogos();
  }

  cargarDashboard() {
    this.adminApi.getDashboardMetrics().subscribe((res: any) => {
      this.metrics = res.data;
    });
  }

  cargarCatalogos() {
    this.centroService.getCentros().subscribe((res: any) => this.centros = res.data);
    this.usuarioService.getUsuarios().subscribe((res: any) => {
      this.directores = res.data.filter((u: any) => u.rol === 'director' || u.rol?.value === 'director');
      this.funcionarios = res.data.filter((u: any) => u.rol === 'funcionario' || u.rol?.value === 'funcionario');
    });
    this.adminApi.getPacientesTotales().subscribe((res: any) => this.pacientes = res.data);
  }

  asignarCentroDirector() {
    if(!this.selectedCentroId || !this.selectedDirectorParaCentro) return;
    this.adminApi.asignarDirectorCentro(this.selectedCentroId, this.selectedDirectorParaCentro).subscribe({
      next: () => alert('Director asignado exitosamente al Centro'),
      error: (err: any) => alert('Error: ' + err.error?.message)
    });
  }

  asignarDirectorFuncionario() {
    if(!this.selectedDirectorId || !this.selectedFuncionarioParaDirector) return;
    this.adminApi.asignarFuncionarioDirector(this.selectedDirectorId, this.selectedFuncionarioParaDirector).subscribe({
      next: () => alert('Funcionario asignado exitosamente al Director'),
      error: (err: any) => alert('Error: ' + err.error?.message)
    });
  }

  asignarPacienteAFuncionario() {
    if(!this.selectedFuncionarioId || !this.selectedPacienteId || !this.selectedCentroParaPaciente) return;
    this.adminApi.asignarPacienteFuncionario(this.selectedFuncionarioId, this.selectedPacienteId, this.selectedCentroParaPaciente).subscribe({
      next: () => alert('Paciente asignado exitosamente al Funcionario'),
      error: (err: any) => alert('Error: ' + err.error?.message)
    });
  }
}
