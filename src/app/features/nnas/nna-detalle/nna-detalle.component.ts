import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { PacienteService, Nna } from '../../../core/services/nna.service';

@Component({
  selector: 'app-nna-detalle',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  templateUrl: './nna-detalle.component.html',
  styleUrls: ['./nna-detalle.component.scss']
})
export class NnaDetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private pacienteService = inject(PacienteService);

  nna = signal<Nna | null>(null);
  isLoading = signal<boolean>(true);
  errorMsg = signal<string>('');

  calendarEvents = signal<any[]>([]);

  private calculateSlaAlerts(fechaIngresoStr: string | undefined) {
    if (!fechaIngresoStr) return [];
    
    const parts = fechaIngresoStr.split('-');
    if (parts.length !== 3) return [];
    
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    
    const baseDate = new Date(year, month, day);
    
    const events = [];
    const slaDays = [75, 80, 89];
    
    for (const days of slaDays) {
      const alertDate = new Date(baseDate);
      alertDate.setDate(baseDate.getDate() + days);
      events.push({
        date: alertDate,
        title: `Alerta SLA - ${days} Días`
      });
    }
    
    return events;
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadNna(id);
      } else {
        this.errorMsg.set('ID de NNA no proporcionado');
        this.isLoading.set(false);
      }
    });
  }

  loadNna(id: string) {
    this.isLoading.set(true);
    this.pacienteService.getPaciente(id).subscribe({
      next: (res) => {
        this.nna.set(res.data);
        this.calendarEvents.set(this.calculateSlaAlerts(res.data.fecha_ingreso));
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message || 'Error al cargar el NNA');
        this.isLoading.set(false);
      }
    });
  }

  get activeAsignacion() {
    const n = this.nna();
    if (!n || !n.asignaciones) return null;
    return n.asignaciones.find(a => a.activo) || null;
  }

  get daysRemaining(): number {
    const n = this.nna();
    if (!n) return 90;
    
    if (n.fecha_ingreso) {
      const parts = n.fecha_ingreso.split('-');
      if (parts.length === 3) {
        const baseDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        const today = new Date();
        const diffTime = today.getTime() - baseDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
        return Math.max(0, 90 - diffDays);
      }
    }
    return Math.max(0, 90 - (n.dias_transcurridos || 0));
  }

  get activeAdultos(): any[] {
    const n = this.nna() as any;
    if (!n || !n.adultos_responsables) return [];
    return n.adultos_responsables.filter((a: any) => a.activo);
  }

  get historicAdultos(): any[] {
    const n = this.nna() as any;
    if (!n || !n.adultos_responsables) return [];
    return n.adultos_responsables.filter((a: any) => !a.activo);
  }
}
