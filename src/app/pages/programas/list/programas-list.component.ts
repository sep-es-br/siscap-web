import { MENSAGENS } from '../../../core/utils/constants';
import { Component, input, OnDestroy, output } from '@angular/core';

import { Subject, Subscription, take, tap } from 'rxjs';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { DeleteModalComponent } from '../../../shared/templates/delete-modal/delete-modal.component';
import { SuccessModalComponent } from '../../../shared/templates/success-modal/success-modal.component';

import { SortColumn } from '../../../shared/directives/sortable/sortable.directive';

import { ProgramasService } from '../../../core/services/programas/programas.service';
import { NavegacaoService } from '../../../core/services/navegacao/navegacao.service';

import { IPrograma, IProgramaTableData, StatusPrograma } from '../../../core/interfaces/programa.interface';

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
import { Router } from '@angular/router';
import { PollingService } from '../../../core/services/polling/polling.service';

@Component({
  selector: 'siscap-programas-list',
  standalone: false,
  templateUrl: './programas-list.component.html',
  styleUrl: './programas-list.component.scss',
})
export class ProgramasListComponent implements OnDestroy{
  public readonly MENSAGENS = MENSAGENS;

  public programasList = input<Array<IProgramaTableData> | null>([]);

  public sortableDirectiveOutput = output<string>();

  private destroy$ = new Subject();
  private pollingSubscription?: Subscription;
  private pollingModalRef?: NgbModalRef;

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
    private readonly _router: Router,
    private readonly _pollingService: PollingService,
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

  ngOnDestroy(): void {
    this.pollingSubscription?.unsubscribe();
    this.pollingModalRef?.dismiss();
    this.destroy$.next(null);
    this.destroy$.complete();
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

  podeExcluir(programa: IProgramaTableData) {
    return ![StatusPrograma.ELABORACAO].includes(programa.statusPrograma)
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
    this.pollingSubscription?.unsubscribe();
    this.currentPolling.status = PollingEtapasStatus.EM_ANDAMENTO;

    this.pollingSubscription = this._programasService
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

          if (this.pollingModalRef) {
            this.pollingModalRef.componentInstance.fasesPolling = this.currentPolling.fases;
          } else {
            this.pollingModalRef = this._ngbModalService.open(
              PollingModalComponent,
              { centered: true }
            );

            this.pollingModalRef.componentInstance.fasesPolling = this.currentPolling.fases;
            if (this.currentPolling.fases.some(fase => fase.etapa === PollingEtapas.AUTUAR)) {
              this.pollingModalRef.componentInstance.tamanhoCard = 'amplo';
              this.pollingModalRef.componentInstance.mensagemSucesso = MENSAGENS.PROGRAMA_AUTUADO_E_ENTRANHADO_COM_SUCESSO;
            }
            this.pollingModalRef.result.then(
              () => { this.pollingModalRef = undefined; },
              (result) => {
                this.pollingModalRef = undefined;
              }
            );
          }
        },
        complete: () => {
          const faseAutorizacaoEnviada = this.currentPolling.fases.find((fase: PollingFasesModel) => fase.etapa === PollingEtapas.CAPTURA_ASSINATURA_PENDENTE && fase.finalizada);
          const faseAutuacaoConfirmada = this.currentPolling.fases.find((fase: PollingFasesModel) => fase.etapa === PollingEtapas.AUTUAR && fase.finalizada);
          const faseEntranhamentoConfirmada = this.currentPolling.fases.find((fase: PollingFasesModel) => fase.etapa === PollingEtapas.ENTRANHAR_ARQUIVO && fase.finalizada);
          const faseAutorizacaoErro = this.currentPolling.fases.find((fase: PollingFasesModel) => fase.etapa === PollingEtapas.CAPTURA_ASSINATURA_PENDENTE && fase.erro);
          const faseAutuacaoErro = this.currentPolling.fases.find((fase: PollingFasesModel) => fase.etapa === PollingEtapas.AUTUAR && fase.erro);
          const faseEntranhamentoErro = this.currentPolling.fases.find((fase: PollingFasesModel) => fase.etapa === PollingEtapas.ENTRANHAR_ARQUIVO && fase.erro);

          if (faseAutorizacaoEnviada) {
            this._toastService.showToast('success', MENSAGENS.AS_AUTORIZACOES_FORAM_ENVIADAS_COM_SUCESSO);
            const programaNaLista = this.programasList()?.find((programa: IProgramaTableData) => programa.id === this.currentPolling.idPrograma);
              if (programaNaLista) {
                programaNaLista.statusPrograma = StatusPrograma.AGUARDANDO_ASSINATURAS
              };
            this._programasService.removerProgramaAguardandoEdocs(this.currentPolling.idPrograma);

          } else if (faseAutorizacaoErro) {
            const errorMessage = (
              faseAutorizacaoErro.msgAlertaExibir &&
              faseAutorizacaoErro.msgAlertaExibir.length > 0
            )
              ? faseAutorizacaoErro.msgAlertaExibir
              : MENSAGENS.OCORREU_UM_ERRO_AO_TENTAR_PROCESSAR_AS_AUTORIZACOES;
            this._toastService.showToast('error', errorMessage);
            this._programasService.removerProgramaAguardandoEdocs(this.currentPolling.idPrograma);
          } else if (faseAutuacaoErro || faseEntranhamentoErro) {
            const faseComErro = faseAutuacaoErro || faseEntranhamentoErro;
            const errorMessage = faseComErro?.msgAlertaExibir?.length
              ? faseComErro.msgAlertaExibir
              : MENSAGENS.OCORREU_UM_ERRO_AO_AUTUAR_OU_ENTRANHAR_O_PROGRAMA_NO_E_DOCS;
            this._toastService.showToast('error', errorMessage);
            this._programasService.removerProgramaAguardandoEdocs(this.currentPolling.idPrograma);
          } else if (faseAutuacaoConfirmada && faseEntranhamentoConfirmada) {
            this._toastService.showToast('success', MENSAGENS.PROGRAMA_AUTUADO_E_ENTRANHADO_COM_SUCESSO);
            this._programasService.removerProgramaAguardandoEdocs(this.currentPolling.idPrograma);
          }

          if (faseAutuacaoConfirmada && faseEntranhamentoConfirmada && !faseAutuacaoErro && !faseEntranhamentoErro) {
            // Busca o Programa pra atualizar o Protocolo EDocs do mesmo
            this._pollingService.executarPollingPersonalizado(
              (() => this._programasService.getById(this.currentPolling.idPrograma)),
              ((response: IPrograma) => {
                if (response && response.protocoloEdocs) return true;
                return false;
              }),
              2000,
            ).subscribe({
              next: (programa: IPrograma) => {
                if (programa.protocoloEdocs) {
                  const programaNaLista = this.programasList()?.find((item: IProgramaTableData) => item.id === programa.id);
                  if (programaNaLista) {
                    programaNaLista.protocoloEdocs = programa.protocoloEdocs;
                    programaNaLista.statusPrograma = StatusPrograma.AUTUADO;
                  }

                  this._programasService.removerProgramaAguardandoEdocs(this.currentPolling.idPrograma);
                  this.currentPolling.idPrograma = -1;
                  this.currentPolling.status = PollingEtapasStatus.FINALIZADA;
                }
              },
              error: (err) => {
                console.error('Ocorreu um erro ao tentar atualizar o Programa!\n', err);
                this._toastService.showToast('error', MENSAGENS.OCORREU_UM_ERRO_AO_TENTAR_ATUALIZAR_O_PROGRAMA);

                this._programasService.removerProgramaAguardandoEdocs(this.currentPolling.idPrograma);
                this.currentPolling.idPrograma = -1;
                this.currentPolling.status = PollingEtapasStatus.FINALIZADA;
              },
            });
          } else {
            this._programasService.removerProgramaAguardandoEdocs(this.currentPolling.idPrograma);
            this.currentPolling.idPrograma = -1;
            this.currentPolling.status = PollingEtapasStatus.FINALIZADA;
          }
        },
      });
  }

  acessarAssinaturasPrograma(idPrograma: number) {
    this._router.navigateByUrl(`/main/programas/${idPrograma}/assinaturas`);
  }
}
