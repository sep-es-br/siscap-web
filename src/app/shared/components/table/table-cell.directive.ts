import { Directive, Input, TemplateRef } from '@angular/core';

/** Personaliza uma coluna: o contexto implícito é o registro da linha. */
@Directive({ selector: 'ng-template[siscapTableCell]', standalone: true })
export class TableCellDirective {
  @Input({ required: true }) siscapTableCell!: string;
  constructor(public readonly template: TemplateRef<unknown>) {}
}
