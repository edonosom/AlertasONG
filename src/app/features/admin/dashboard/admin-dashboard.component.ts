import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AdminApiService, AdminMetrics } from '../../../core/services/admin-api.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  authService = inject(AuthService);
  adminApi = inject(AdminApiService);
  
  // Exponemos el usuario actual a la vista
  user = this.authService.currentUser;

  metrics = signal<AdminMetrics | null>(null);
  metricsError = signal<boolean>(false);

  ngOnInit() {
    this.adminApi.getDashboardMetrics().subscribe({
      next: (res: any) => {
        this.metrics.set(res.data);
        this.metricsError.set(false);
      },
      error: (err: any) => {
        console.error('Error cargando métricas del dashboard:', err);
        this.metricsError.set(true);
      }
    });
  }

  logout() {
    this.authService.logout().subscribe();
  }
}
