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
      'span.ql-size.ql-picker': 'Tamanho da fonte',
      'span.ql-header.ql-picker': 'Tamanho do cabeçalho',
      'button.ql-bold': 'Negrito',
      'button.ql-italic': 'Itálico',
      'button.ql-underline': 'Sublinhado',
      'button.ql-strike': 'Tachado',
      'button.ql-list[value="ordered"]': 'Lista ordenada',
      'button.ql-list[value="bullet"]': 'Lista não ordenada',
      'span.ql-align': 'Alinhamento',
      'span.ql-color': 'Cor do texto',
      'span.ql-background': 'Cor de fundo do texto',
      'button.ql-link': 'Link',
      'button.ql-image': 'Imagem',
      'button.ql-video': 'Vídeo',
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
