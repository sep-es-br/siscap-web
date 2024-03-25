import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ComponentsModule } from './components/components.module';
import { PagesModule } from './pages/pages.module';
import { NgSelectConfig } from '@ng-select/ng-select';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PagesModule, ComponentsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'siscap-web';

  constructor(private config: NgSelectConfig) {
    config.notFoundText = 'Nenhum item encontrado.'
  }
}
