import { MENSAGENS } from '../../../core/utils/constants';
import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { QuillEditorComponent } from 'ngx-quill';
import { ToolbarTooltipDirective } from './toolbar-tooltip.directive';

@Component({
  selector: 'siscap-text-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    QuillEditorComponent,
    ToolbarTooltipDirective,
  ],
  templateUrl: './text-editor.component.html',
  styleUrl: './text-editor.component.scss',
})
export class TextEditorComponent {
  @Input() public controle!: FormControl<string | null>;
  @Input() public isModoEdicao: boolean = true;

  public toolbarTooltips: { target: HTMLElement; text: string }[] = [];

  public mapeamentoSeletorConteudoToolbarModuleTooltip: Record<string, string> =
    {
      'span.ql-size.ql-picker': MENSAGENS.TAMANHO_DA_FONTE,
      'span.ql-header.ql-picker': MENSAGENS.TAMANHO_DO_CABECALHO,
      'button.ql-bold': MENSAGENS.NEGRITO,
      'button.ql-italic': MENSAGENS.ITALICO,
      'button.ql-underline': MENSAGENS.SUBLINHADO,
      'button.ql-strike': MENSAGENS.TACHADO,
      'button.ql-list[value="ordered"]': MENSAGENS.LISTA_ORDENADA,
      'button.ql-list[value="bullet"]': MENSAGENS.LISTA_NAO_ORDENADA,
      'span.ql-align': MENSAGENS.ALINHAMENTO,
      'span.ql-color': MENSAGENS.COR_DO_TEXTO,
      'span.ql-background': MENSAGENS.COR_DE_FUNDO_DO_TEXTO,
      'button.ql-link': MENSAGENS.LINK,
      'button.ql-image': MENSAGENS.IMAGEM,
      'button.ql-video': MENSAGENS.VIDEO,
    };

  public editorCriado(editor: { getModule(name: string): unknown }): void {
    const toolbar = editor.getModule('toolbar') as { container?: HTMLElement } | undefined;
    this.toolbarTooltips = [];

    for (const [selector, text] of Object.entries(this.mapeamentoSeletorConteudoToolbarModuleTooltip)) {
      const target = toolbar?.container?.querySelector<HTMLElement>(selector);
      if (target) this.toolbarTooltips.push({ target, text });
    }
  }
}
