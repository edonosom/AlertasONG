import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonicModule],
})
export class AppComponent {
  // Inject to trigger the effect that applies the theme on startup
  private _themeService = inject(ThemeService);
}
