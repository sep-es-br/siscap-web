import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormArray, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MENSAGENS } from '../../../core/utils/constants';
import { TemplatesModule } from '../../templates/templates.module';

export interface IndicadorCardDados {
  nome: string;
  fonte?: string | null;
  unidadeMedida?: string | null;
  baseReferencia?: string | number | null;
  formula?: string | null;
  deProjeto?: boolean;
}

export interface IndicadorCardMeta {
  anoMeta: number | string;
  valorMeta: number | string | null;
}

@Component({
  selector: 'siscap-indicador-card',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TemplatesModule],
  templateUrl: './indicador-card.component.html',
  styleUrl: './indicador-card.component.scss',
})
export class IndicadorCardComponent {
  @Input({ required: true }) indicador!: IndicadorCardDados;
  // São os controles originais do formulário consumidor, sem cópia de valores.
  @Input({ required: true }) metasProjeto!: FormArray;
  @Input({ required: true }) idPrefixo!: string;
  @Input() metasReferencia: readonly IndicadorCardMeta[] = [];
  @Input() podeRemover = false;
  @Input() rotuloRemover: string = MENSAGENS.REMOVER_INDICADOR;
  @Output() remover = new EventEmitter<void>();

  public readonly MENSAGENS = MENSAGENS;

  public controleMeta(index: number): FormControl {
    return this.metasProjeto.at(index).get('valorMeta') as FormControl;
  }

  public idMeta(index: number): string {
    return `${this.idPrefixo}-${index}`;
  }

  public trackByMeta(index: number, meta: IndicadorCardMeta | AbstractControl): number | string {
    return (meta instanceof AbstractControl ? meta.get('anoMeta')?.value : meta.anoMeta) ?? index;
  }

  public removerIndicador(): void {
    if (this.podeRemover) this.remover.emit();
  }
}
