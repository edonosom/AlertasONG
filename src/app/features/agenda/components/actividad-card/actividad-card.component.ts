import { Component, computed, input, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { DetalleAlertaDia } from '../../../../core/services/alerta-api.service';

/**
 * Tarjeta para actividades PERSONALIZADAS (agenda propia del usuario).
 * A diferencia de app-nna-card no muestra el progreso SLA del NNA: muestra
 * la actividad en sí y despliega su detalle al hacer click.
 */
@Component({
  selector: 'app-actividad-card',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  templateUrl: './actividad-card.component.html',
  styleUrls: ['./actividad-card.component.scss']
})
export class ActividadCardComponent {
  data = input.required<DetalleAlertaDia>();
  expanded = model(false);

  // Sin NNA vinculado = actividad personal del usuario
  esPersonal = computed(() => this.data().es_personal ?? !this.data().nna_id);

  fechaLarga = computed(() => {
    const raw = this.data().fecha_programada || this.data().fecha_inicio_sla;
    if (!raw) return '';
    const fecha = new Date(raw);
    if (isNaN(fecha.getTime())) return raw;
    return fecha.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  });

  estadoLabel = computed(() => {
    const estado = this.data().estado_alerta || 'pendiente';
    return estado.charAt(0).toUpperCase() + estado.slice(1).replace(/_/g, ' ');
  });

  toggle() {
    this.expanded.update(v => !v);
  }
}
