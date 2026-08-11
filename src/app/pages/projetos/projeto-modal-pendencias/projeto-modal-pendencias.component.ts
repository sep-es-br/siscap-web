import { Component, Input, OnChanges } from '@angular/core';
import { IPendenciaProjeto } from '../../../core/interfaces/pendencias.validacao.dic.interface';
import { AbaProjeto } from '../../../core/types/form/aba-projeto.type';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';


interface IGrupoPendencias {
  aba: AbaProjeto;
  nomeAba: string;
  pendencias: IPendenciaProjeto[];
}

@Component({
  selector: 'app-projeto-modal-pendencias',
  standalone: true,
  templateUrl: './projeto-modal-pendencias.component.html',
  styleUrl: './projeto-modal-pendencias.component.scss'
})
export class ModalPendenciasProjetoComponent implements OnChanges {

  @Input()
  public pendencias: IPendenciaProjeto[] = [];

  public pendenciasAgrupadas: IGrupoPendencias[] = [];


  constructor(
    public activeModal: NgbActiveModal,
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


  public obterIconeAba(
    aba: AbaProjeto,
  ): string {

    switch (aba) {

      case 'propriedades':
        return 'fa-solid fa-file-lines';

      case 'indicadores':
        return 'fa-solid fa-bullseye';

      case 'ods':
        return 'fa-solid fa-globe';

      case 'planejamento':
        return 'fa-solid fa-chart-column';

      default:
        return 'fa-solid fa-circle-exclamation';

    }

  }


  public irParaPendencia(
    pendencia: IPendenciaProjeto,
  ): void {

    this.activeModal.close({
      acao: 'irParaPendencia',
      pendencia,
    });

  }


  public revisarPendencias(): void {

    this.activeModal.close({
      acao: 'revisarPendencias',
    });

  }

}
