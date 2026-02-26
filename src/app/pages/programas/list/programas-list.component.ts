import { Component, input, output } from '@angular/core';

import { take, tap } from 'rxjs';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { DeleteModalComponent } from '../../../shared/templates/delete-modal/delete-modal.component';
import { SuccessModalComponent } from '../../../shared/templates/success-modal/success-modal.component';

import { SortColumn } from '../../../shared/directives/sortable/sortable.directive';

import { ProgramasService } from '../../../core/services/programas/programas.service';
import { NavegacaoService } from '../../../core/services/navegacao/navegacao.service';

import { IPrograma, IProgramaTableData } from '../../../core/interfaces/programa.interface';

import {
  BreadcrumbAcoesEnum,
  BreadcrumbContextoEnum,
} from '../../../core/enums/breadcrumb.enum';

import { getSimboloMoeda } from '../../../core/utils/functions';
import { acharDescricaoEtapaPorEtapa, getFaseStatus, PollingEtapas, PollingEtapasStatus } from '../../../core/interfaces/polling.interface';
import { PollingFasesModel } from '../../../core/models/polling.model';
import { PollingModalComponent } from '../../../shared/templates/polling-modal/polling-modal.component';
import { ToastService } from '../../../core/services/toast/toast.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'siscap-programas-list',
  standalone: false,
  templateUrl: './programas-list.component.html',
  styleUrl: './programas-list.component.scss',
})
export class ProgramasListComponent {
  public programasList = input<Array<IProgramaTableData> | null>([]);

  public sortableDirectiveOutput = output<string>();

  public getSimboloMoeda: (moeda: string | undefined | null) => string =
    getSimboloMoeda;

  public currentPolling: {
    idPrograma: number;
    status: PollingEtapasStatus;
    fases: Array<PollingFasesModel>;
  } = {
    idPrograma: -1,
    status: PollingEtapasStatus.NAO_INICIADA,
    fases: [],
  };

  urlEdocsBase = environment.edocsUrl;

  constructor(
    private readonly _programasService: ProgramasService,
    private readonly _navegacaoService: NavegacaoService,
    private readonly _ngbModalService: NgbModal,
    private readonly _toastService: ToastService,
  ) {
    this._programasService.programasAguardandoEdocs$
      .pipe(
        take(1)
      )
      .subscribe(set => {
        const programaId = set.values().next().value;
        if (programaId) {
          this.currentPolling.idPrograma = programaId;
          this.dispararModalPolling(programaId);
        }
      });
  }

  public sortColumn(event: SortColumn): void {
    this.sortableDirectiveOutput.emit(`${event.column},${event.direction}`);
  }

  public tableActionOutputEvent(event: { acao: string; id: number }): void {
    switch (event.acao) {
      case 'editar':
        this.editarPrograma(event.id);
        break;

      case 'deletar':
        this.deletarPrograma(event.id);
        break;

      default:
        break;
    }
  }

  public editarPrograma(id: number): void {
    this._programasService.idPrograma$.next(id);

    this._navegacaoService.navegacaoSimples(
      BreadcrumbContextoEnum.Programas,
      BreadcrumbAcoesEnum.Editar
    );
  }

  public deletarPrograma(id: number): void {
    const programaTableData = this.programasList()?.find(
      (programa) => programa.id === id
    );

    this.dispararModalDeletar(programaTableData!);
  }

  private dispararModalDeletar(programaTableData: IProgramaTableData): void {
    const modalRef = this._ngbModalService.open(DeleteModalComponent, {
      centered: true,
      backdrop: 'static',
    });

    modalRef.componentInstance.conteudo = `${programaTableData.sigla} - ${programaTableData.titulo}`;

    modalRef.result.then(
      (resolve) => {
        this._programasService
          .deleteById(programaTableData.id)
          .pipe(tap((response) => this.dispararModalSucesso(response)))
          .subscribe();
      },
      (reject) => {}
    );
  }

  private dispararModalSucesso(response: string): void {
    const modalRef = this._ngbModalService.open(SuccessModalComponent, {
      centered: true,
    });

    modalRef.componentInstance.conteudo = response;

    modalRef.result.then(
      (resolve) => {},
      (reject) => {
        this._navegacaoService.navegacaoComRecarregamento(
          BreadcrumbContextoEnum.Programas
        );
      }
    );
  }

  dispararModalPolling(idPrograma: number) {
    let pollingModalRef: NgbModalRef;
    this.currentPolling.status = PollingEtapasStatus.EM_ANDAMENTO;

    this._programasService
      .executarPollingFasesProgramas(idPrograma)
      .subscribe({
        next: (listaFases: PollingFasesModel[]) => {
          this.currentPolling.fases = listaFases.map((fase) => {
            const descricao = acharDescricaoEtapaPorEtapa(fase.etapa);
            const status = getFaseStatus(fase.iniciada, fase.finalizada, fase.erro);

            return {
              ...fase,
              descricao,
              status,
            };
          });

          if (pollingModalRef) {
            pollingModalRef.componentInstance.fasesPolling = this.currentPolling.fases;
          } else {
            pollingModalRef = this._ngbModalService.open(
              PollingModalComponent,
              { centered: true }
            );

            pollingModalRef.componentInstance.fasesPolling = this.currentPolling.fases;
            pollingModalRef.result.then(
              (resolve) => {},
              (result) => {
                if (result === 'fechar') {
                  pollingModalRef.close();
                }
              }
            );
          }
        },
        complete: () => {
          const faseAutorizacaoEnviada = this.currentPolling.fases.find((fase: PollingFasesModel) => fase.etapa === PollingEtapas.CAPTURA_ASSINATURA_PENDENTE && fase.finalizada);
          const faseAutuacaoConfirmada = this.currentPolling.fases.find((fase: PollingFasesModel) => fase.etapa === PollingEtapas.AUTUAR && fase.finalizada);
          const faseAutorizacaoErro = this.currentPolling.fases.find((fase: PollingFasesModel) => fase.etapa === PollingEtapas.CAPTURA_ASSINATURA_PENDENTE && fase.erro);
          const faseAutuacaoErro = this.currentPolling.fases.find((fase: PollingFasesModel) => fase.etapa === PollingEtapas.AUTUAR && fase.erro);

          if (faseAutorizacaoEnviada) {
            this._toastService.showToast('success', 'As Autorizações foram enviadas com sucesso!');
          } else if (faseAutuacaoConfirmada) {
            this._toastService.showToast('success', 'A Autuação foi realizada com sucesso!');
          } else if (faseAutorizacaoErro) {
            const errorMessage = (
              faseAutorizacaoErro.msgAlertaExibir &&
              faseAutorizacaoErro.msgAlertaExibir.length > 0
            )
              ? faseAutorizacaoErro.msgAlertaExibir
              : 'Ocorreu um erro ao tentar processar as Autorizações!';
            this._toastService.showToast('error', errorMessage);
          } else if (faseAutuacaoErro) {
            const errorMessage = (
              faseAutuacaoErro.msgAlertaExibir &&
              faseAutuacaoErro.msgAlertaExibir.length > 0
            )
              ? faseAutuacaoErro.msgAlertaExibir
              : 'Ocorreu um erro ao tentar Autuar o programa!';
            this._toastService.showToast('error', errorMessage);
          }

          this.currentPolling.status = PollingEtapasStatus.FINALIZADA;
          this._programasService.removerProgramaAguardandoEdocs(this.currentPolling.idPrograma);

          if (faseAutuacaoConfirmada) {
            // Busca o Programa pra atualizar o Protocolo EDocs do mesmo
            this._programasService.getById(this.currentPolling.idPrograma).subscribe({
              next: (response: IPrograma) => {
                const programaNaLista = this.programasList()?.find((programa: IProgramaTableData) => programa.id === response.id);
                if (programaNaLista) programaNaLista.protocoloEDocs = response.protocoloEDocs;
              },
            });
          } else {
            this.currentPolling.idPrograma = -1;
          }
        },
      });
  }
}
