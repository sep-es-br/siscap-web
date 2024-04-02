import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { NgSelectConfig } from '@ng-select/ng-select';

import { CoreModule } from './core/core.module';
import { PagesModule } from './pages/pages.module';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CoreModule, PagesModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'siscap-web';

  constructor(private config: NgSelectConfig) {
    config.notFoundText = 'Nenhum item encontrado.';
  }
}
