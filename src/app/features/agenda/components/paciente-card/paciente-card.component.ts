import { Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { DetalleAlertaDia } from '../../../../core/services/alerta-api.service';

@Component({
  selector: 'app-paciente-card',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './paciente-card.component.html',
  styleUrls: ['./paciente-card.component.scss']
})
export class PacienteCardComponent {
  data = input.required<DetalleAlertaDia>();
  onConfirmarGestion = output<string>();

  // Enmascarar RUT por privacidad
  maskedRut = computed(() => {
    const rut = this.data().rut;
    if (!rut || rut.length < 5) return rut;
    return rut.substring(0, 2) + ' ••• ••• ' + rut.substring(rut.length - 2);
  });

  // Calcular porcentaje para la barra (0 a 90 días)
  progressPercentage = computed(() => {
    const maxDays = 90;
    const current = this.data().dias_transcurridos;
    const perc = (current / maxDays) * 100;
    return Math.min(Math.max(perc, 0), 100);
  });

  // Determinar la clase semántica según los días transcurridos
  semanticColorClass = computed(() => {
    // Si es alerta personalizada, usar un estilo azul neutro
    if (this.data().tipo === 'PERSONALIZADA') return 'custom';
    
    const days = this.data().dias_transcurridos;
    if (days >= 89) return 'critical';
    if (days >= 75) return 'warning';
    return 'safe';
  });

  confirmarGestion() {
    this.onConfirmarGestion.emit(this.data().alerta_id);
  }
}
