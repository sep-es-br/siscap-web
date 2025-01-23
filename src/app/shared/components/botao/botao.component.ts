import { CommonModule } from '@angular/common';
import {
  Component,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
} from '@angular/core';

import { TBotaoAcao } from './botao.config';

import { IBotaoPropriedades } from './botao.interface';

@Component({
  selector: 'siscap-botao',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './botao.component.html',
  styleUrl: './botao.component.scss',
})
export class BotaoComponent {
  public propriedades: InputSignal<IBotaoPropriedades> =
    input.required<IBotaoPropriedades>();

  public acao: OutputEmitterRef<TBotaoAcao> = output<TBotaoAcao>();
}
