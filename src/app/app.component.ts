import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { NgSelectConfig } from '@ng-select/ng-select';
import { NgbInputDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from './shared/shared.module';
import { PagesModule } from './pages/pages.module';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SharedModule, PagesModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'siscap-web';

  constructor(
    private readonly ngSelectConfig: NgSelectConfig,
    private readonly ngbInputDatepickerConfig: NgbInputDatepickerConfig
  ) {
    // Configurações globais do componente NgSelect
    ngSelectConfig.notFoundText = 'Nenhum item encontrado.';

    // Configurações globais do componente NgbInputDatepicker (Ng Bootstrap)
    ngbInputDatepickerConfig.firstDayOfWeek = 7; // Domingo
  }
}
