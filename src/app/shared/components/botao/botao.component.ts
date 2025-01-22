import { CommonModule } from '@angular/common';
import {
  Component,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
} from '@angular/core';
import { IBotaoPropriedades } from './botao.interface';
import { TBotaoAcao } from './botao.config';

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
  public isDisabled: InputSignal<boolean | null> = input<boolean | null>(false);

  public acao: OutputEmitterRef<TBotaoAcao> = output<TBotaoAcao>();
}
