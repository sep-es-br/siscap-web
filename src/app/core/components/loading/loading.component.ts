import { Component, Input } from '@angular/core';

@Component({
  selector: 'siscap-loading',
  standalone: false,
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.scss',
})
export class LoadingComponent {
  @Input('loadingText') loadingText: string = "Carregando";
}
