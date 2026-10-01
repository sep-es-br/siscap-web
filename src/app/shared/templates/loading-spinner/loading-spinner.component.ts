import { Component, input } from '@angular/core';
import { MENSAGENS } from '../../../core/utils/constants';

@Component({
  selector: 'loading-spinner',
  standalone: false,
  templateUrl: './loading-spinner.component.html',
  styleUrl: './loading-spinner.component.scss',
})
export class LoadingSpinnerComponent {
  public textoProcessando = input<string>(MENSAGENS.CARREGANDO);
}
