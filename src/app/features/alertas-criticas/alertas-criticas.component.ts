import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AlertaApiService, DetalleAlertaDia, DetalleDiarioResponse } from '../../core/services/alerta-api.service';

@Component({
  selector: 'app-alertas-criticas',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, FormsModule],
  templateUrl: './alertas-criticas.component.html',
  styleUrls: ['./alertas-criticas.component.scss'],
})
export class AlertasCriticasComponent implements OnInit {
  private readonly alertaService = inject(AlertaApiService);

  isLoading = signal(true);
  alertasSistema = signal<DetalleAlertaDia[]>([]);
  alertasManuales = signal<DetalleAlertaDia[]>([]);
  
  searchQuery = signal<string>('');

  filteredSistema = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.alertasSistema();
    return this.alertasSistema().filter(a => 
      (a.nna_nombre_completo && a.nna_nombre_completo.toLowerCase().includes(q)) ||
      (a.rut && a.rut.toLowerCase().includes(q)) ||
      (a.titulo && a.titulo.toLowerCase().includes(q))
    );
  });

  filteredManuales = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.alertasManuales();
    return this.alertasManuales().filter(a => 
      (a.nna_nombre_completo && a.nna_nombre_completo.toLowerCase().includes(q)) ||
      (a.rut && a.rut.toLowerCase().includes(q)) ||
      (a.titulo && a.titulo.toLowerCase().includes(q))
    );
  });

  ngOnInit() {
    this.cargarAlertasCriticas();
  }

  cargarAlertasCriticas() {
    this.isLoading.set(true);
    this.alertaService.getAlertasCriticas().subscribe({
      next: (res: DetalleDiarioResponse) => {
        const todas: DetalleAlertaDia[] = res.data || [];
        this.alertasSistema.set(todas.filter((a: DetalleAlertaDia) => a.tipo === 'SLA'));
        this.alertasManuales.set(todas.filter((a: DetalleAlertaDia) => a.tipo === 'PERSONALIZADA'));
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Error cargando alertas críticas:', err);
        this.isLoading.set(false);
      }
    });
  }

  getNnaLink(nnaId: string): string {
    return `/nnas/${nnaId}/agenda`;
  }
}
