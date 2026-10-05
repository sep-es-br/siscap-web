import { MENSAGENS } from '../../../core/utils/constants';
import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnDestroy,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { fromEvent, merge, Subscription, tap } from 'rxjs';
import { QuillEditorComponent } from 'ngx-quill';
import { NgbTooltip, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'siscap-text-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    QuillEditorComponent,
    NgbTooltipModule,
  ],
  templateUrl: './text-editor.component.html',
  styleUrl: './text-editor.component.scss',
})
export class TextEditorComponent implements OnDestroy {
  @Input() public controle!: FormControl<string | null>;
  @Input() public isModoEdicao: boolean = true;

  @ViewChildren('toolbarModuleTooltip')
  public ngbTooltipList!: QueryList<NgbTooltip>;

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

  private _subscription: Subscription = new Subscription();

  constructor() {}

  public editorCriado(event: any): void {
    this.adicionarTooltipsToolbarModules();
  }

  private adicionarTooltipsToolbarModules(): void {
    for (const seletor in this.mapeamentoSeletorConteudoToolbarModuleTooltip) {
      const conteudo =
        this.mapeamentoSeletorConteudoToolbarModuleTooltip[seletor];

      this.construirEventListeners(seletor, conteudo);
    }
  }

  private construirEventListeners(seletor: string, conteudo: string): void {
    const elemento = document.querySelector(seletor)!;

    const ngbTooltipRef = this.ngbTooltipList.find(
      (ngbTooltip) =>
        ngbTooltip.ngbTooltip === conteudo &&
        ngbTooltip.positionTarget === seletor
    )!;

    const mouseEnterEventListener$ = fromEvent(elemento, 'mouseenter').pipe(
      tap((event: Event) => ngbTooltipRef.open())
    );

    const mouseLeaveEventListener$ = fromEvent(elemento, 'mouseleave').pipe(
      tap((event: Event) => ngbTooltipRef.close())
    );

    this._subscription.add(
      merge(mouseEnterEventListener$, mouseLeaveEventListener$).subscribe()
    );
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
