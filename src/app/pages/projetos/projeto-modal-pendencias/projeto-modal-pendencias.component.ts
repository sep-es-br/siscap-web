import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { IPendenciaProjeto } from '../../../core/interfaces/pendencias.validacao.dic.interface';
import { AbaProjeto } from '../../../core/types/form/aba-projeto.type';
import { NgbModalModule, NgbPopoverModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { TemplatesModule } from '../../../shared/templates/templates.module';
import { DialogModule } from 'primeng/dialog';

interface IGrupoPendencias {
  aba: AbaProjeto;
  nomeAba: string;
  pendencias: IPendenciaProjeto[];
}

@Component({
  selector: 'siscap-projeto-modal-pendencias',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgbTooltipModule,
    NgbModalModule,
    NgbPopoverModule,
    TemplatesModule,
    DialogModule],
  templateUrl: './projeto-modal-pendencias.component.html',
  styleUrl: './projeto-modal-pendencias.component.scss'
})
export class ModalPendenciasProjetoComponent implements OnChanges {

  @Input()
  public pendencias: IPendenciaProjeto[] = [];

  @Output()
  public close = new EventEmitter();

  @Output()
  public navegarPendencia = new EventEmitter<IPendenciaProjeto>();

  public pendenciasAgrupadas: IGrupoPendencias[] = [];

  constructor(

  ) { }

  ngOnChanges(): void {

    this.agruparPendencias();

  }

  private agruparPendencias(): void {

    const grupos = new Map<string, IGrupoPendencias>();

    this.pendencias.forEach((pendencia) => {

      if (!grupos.has(pendencia.aba)) {

        grupos.set(
          pendencia.aba,
          {
            aba: pendencia.aba,
            nomeAba: pendencia.nomeAba,
            pendencias: [],
          },
        );

      }

      grupos
        .get(pendencia.aba)
        ?.pendencias
        .push(pendencia);

    });

    this.pendenciasAgrupadas =
      Array.from(grupos.values());

  }


  // public obterIconeAba(
  //   aba: AbaProjeto,
  // ): string {
  //   switch (aba) {
  //     case 'propriedades':
  //       return 'fa-solid fa-file-lines';
  //     case 'indicadores':
  //       return 'fa-solid fa-bullseye';
  //     case 'ods':
  //       return 'fa-solid fa-globe';
  //     case 'planejamento':
  //       return 'fa-solid fa-chart-column';
  //     default:
  //       return 'fa-solid fa-circle-exclamation';
  //   }
  // }

  public revisarPendencias(): void {
    // this.activeModal.close({
    //   acao: 'revisarPendencias',
    // });
  }

  public irParaPendencia(
    pendencia: IPendenciaProjeto,
  ): void {
    this.navegarPendencia.emit(pendencia);
  }

  fechar(): void {
    this.close.emit();
  }

}
