import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CentroService } from '../../../../core/services/centro.service';

@Component({
  selector: 'app-centro-detalle',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  templateUrl: './centro-detalle.component.html',
  styleUrls: ['./centro-detalle.component.scss']
})
export class CentroDetalleComponent implements OnInit {
  route = inject(ActivatedRoute);
  centroService = inject(CentroService);

  centro = signal<any>(null);
  isLoading = signal<boolean>(true);
  errorMsg = signal<string | null>(null);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadCentro(id);
      }
    });
  }

  loadCentro(id: string) {
    this.isLoading.set(true);
    this.centroService.getCentro(id).subscribe({
      next: (res) => {
        this.centro.set(res.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading centro details:', err);
        this.errorMsg.set('No se pudo cargar la información del centro.');
        this.isLoading.set(false);
      }
    });
  }

  // Derived arrays
  get directores() {
    return this.centro()?.directores || [];
  }

  get funcionarios() {
    // Collect all funcionarios from all directores
    const directores = this.centro()?.directores || [];
    const allFuncionarios = [];
    const seenIds = new Set<string>();

    for (const dir of directores) {
      for (const func of (dir.funcionarios || [])) {
        if (!seenIds.has(func.id)) {
          seenIds.add(func.id);
          allFuncionarios.push(func);
        }
      }
    }
    return allFuncionarios;
  }
}
