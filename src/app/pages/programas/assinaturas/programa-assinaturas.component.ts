import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProgramasService } from '../../../core/services/programas/programas.service';
import {
  IPrograma,
  IProgramaAssinaturasForm,
  StatusAssinaturaPrograma,
} from '../../../core/interfaces/programa.interface';
import { OpcoesDropdownService } from '../../../core/services/opcoes-dropdown/opcoes-dropdown.service';
import { TipoOrganizacaoEnum } from '../../../core/enums/tipo-organizacao.enum';
import { forkJoin } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { UsuarioService } from '../../../core/services/usuario/usuario.service';
import { UsuarioPerfilModel } from '../../../core/models/usuario.model';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationModalComponent } from '../../../shared/templates/confirmation-modal/confirmation-modal.component';
import { AppStatus } from '../../../core/enums/app-status.enum';
import { ToastService } from '../../../core/services/toast/toast.service';
import { RequestStatus } from '../../../core/enums/request-status.enum';
import { PollingModalComponent } from '../../../shared/templates/polling-modal/polling-modal.component';
import {
  acharDescricaoEtapaPorEtapa,
  getFaseStatus,
  IPollingFases,
  PollingEtapasStatus,
} from '../../../core/interfaces/polling.interface';

@Component({
  selector: 'siscap-programa-assinaturas',
  templateUrl: './programa-assinaturas.component.html',
  styleUrl: './programa-assinaturas.component.scss',
})
export class ProgramaAssinaturasComponent {
  appStatus: AppStatus = AppStatus.LOADING;

  programaAtual!: IProgramaAssinaturasForm;

  listaNomesOrgaosExecutores: Array<string> = [];

  listaDicsPropostos: Array<string> = [];

  formPrograma: FormGroup = new FormGroup({
    tituloPrograma: new FormControl(''),
    siglaPrograma: new FormControl(''),
    orgaosPrograma: new FormControl(''),
    valorPrograma: new FormControl(''),
    dicsPrograma: new FormControl(''),
    valorTotalEstimadoProgama: new FormControl(''),
  });

  usuarioAtual!: UsuarioPerfilModel;

  fasesPollingAssinatura: Array<IPollingFases> = [];

  statusAssinatura: PollingEtapasStatus = PollingEtapasStatus.NAO_INICIADA;

  assinaturaPropria: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private _programasService: ProgramasService,
    private readonly _opcoesDropdownService: OpcoesDropdownService,
    private readonly _usuarioService: UsuarioService,
    private readonly _ngbModalService: NgbModal,
    private readonly _toastService: ToastService
  ) {
    this.appStatus = AppStatus.LOADING;

    this.usuarioAtual = this._usuarioService.usuarioPerfil;

    const idPrograma = this.route.snapshot.paramMap.get('id');

    if (idPrograma) {
      this._programasService.idPrograma$.next(Number(idPrograma));

      const programaSubscription$ = this._programasService.getById(
        Number(idPrograma)
      );

      const organizacoesSubscription$ =
        this._opcoesDropdownService.getOpcoesOrganizacoes(
          TipoOrganizacaoEnum.Secretaria
        );

      const projetosSubscription$ =
        this._opcoesDropdownService.getOpcoesProjetosPropostos();

      forkJoin([
        programaSubscription$,
        organizacoesSubscription$,
        projetosSubscription$,
      ]).subscribe({
        next: (results) => {
          const programaResponse: IPrograma = results[0];
          this.listaNomesOrgaosExecutores = results[1]
            .filter((el) =>
              programaResponse.orgaosEnvolvidosList
                .map((el) => el.id)
                .includes(el.id)
            )
            .map((el) => el.nome);
          this.listaDicsPropostos = results[2]
            .filter((el) =>
              programaResponse.idProjetoPropostoList.includes(el.id)
            )
            .map((el) => el.nome);

          if (
            !programaResponse.programaAssinantesEdocsDto ||
            programaResponse.programaAssinantesEdocsDto.length === 0
          ) {
            this.appStatus = AppStatus.ERROR;
            console.error(
              'Não há lista de assinantes!\n programaAssinantesEdocsDto: ',
              programaResponse.programaAssinantesEdocsDto
            );
            this._toastService.showToast(
              'warning',
              'A lista de assinantes não existe ou está vazia! É necessário solicitar as Autorizações primeiro.'
            );

            this.programaAtual = {
              ...programaResponse,
              nomesOrgaosExecutores: this.listaNomesOrgaosExecutores,
              listaDICSPropostos: this.listaDicsPropostos,
              demaisAssinaturas: [],
            };
          } else {
            this.atualizarAssinaturas(programaResponse);
          }
        },
        error: (err) => {
          console.error('Houve um erro com uma das requisições: ', err);
        },
        complete: () => {
          // Finalizado todas as operações, e o observable foi encerrado
          this.formPrograma.setValue({
            tituloPrograma: this.programaAtual.titulo,
            siglaPrograma: this.programaAtual.sigla,
            orgaosPrograma: this.programaAtual.nomesOrgaosExecutores,
            valorPrograma: `R$ ${this.programaAtual.valor.quantia.toLocaleString(
              'pt-BR'
            )}`,
            dicsPrograma: this.programaAtual.listaDICSPropostos,
            valorTotalEstimadoProgama: `R$ ${this.programaAtual.valorCalculadoTotal.toLocaleString(
              'pt-BR',
              { minimumFractionDigits: 2, maximumFractionDigits: 2 }
            )}`,
          });

          this.formPrograma.disable();

          this.appStatus = AppStatus.SUCCESS;
        },
      });
    }
  }

  atualizarAssinaturas(programa: IPrograma) {
    // Função chamada no início da execução do componente, e após realizar uma assinatura

    if (programa.programaAssinantesEdocsDto && programa.programaAssinantesEdocsDto.length > 0) {
      const assinaturaUsuarioAtual =
        programa.programaAssinantesEdocsDto.find(
          (ass) => ass.idPessoa === this.usuarioAtual.idPessoa
        );

      if (assinaturaUsuarioAtual) {
        const demaisAssinaturas =
          programa.programaAssinantesEdocsDto.filter(
            (ass) => ass.idPessoa !== assinaturaUsuarioAtual.idPessoa
          );

        this.programaAtual = {
          ...programa,
          nomesOrgaosExecutores: this.listaNomesOrgaosExecutores,
          listaDICSPropostos: this.listaDicsPropostos,
          assinaturaUsuarioAtual,
          demaisAssinaturas,
        };
      } else {
        this.programaAtual = {
          ...programa,
          nomesOrgaosExecutores: this.listaNomesOrgaosExecutores,
          listaDICSPropostos: this.listaDicsPropostos,
          demaisAssinaturas: programa.programaAssinantesEdocsDto,
        };
      }
    }
  }

  exportarPrograma() {
    this.appStatus = AppStatus.LOADING;

    const $requestStatus = this._programasService.exportById(
      this.programaAtual.id,
      this.programaAtual.titulo
    );

    $requestStatus.subscribe((newStatus) => {
      if (newStatus === RequestStatus.SUCCESS) {
        this.appStatus = AppStatus.SUCCESS;
      } else if (newStatus === RequestStatus.ERROR) {
        this.appStatus = AppStatus.EMPTY;
      }
    });
  }

  dispararModalConfirmarAssinatura() {
    const modalRef = this._ngbModalService.open(ConfirmationModalComponent, {
      centered: true,
    });

    modalRef.componentInstance.config = {
      titulo: 'Confirmar assinatura',
      textoPrincipal: 'Sua confirmação autorizará o início dos procedimentos de captação de recursos deste programa.',
    };

    modalRef.result.then(
      (resolve) => { },
      (result) => {
        if (result === 'confirmar') {
          this.appStatus = AppStatus.LOADING;

          this._programasService.assinarAutorizacaoPrograma(this.programaAtual.id, this.usuarioAtual.subNovo).subscribe({
            next: (res) => {
              modalRef.close();

              this.dispararModalPollingPrograma();

              this.appStatus = AppStatus.SUCCESS;
            },
            error: (err) => {
              console.error('Ocorreu um erro ao tentar assinar o programa!\n', err);
              this._toastService.showToast(
                'error',
                'Ocorreu um erro ao tentar assinar o Programa!',
              );
            }
          });
        }
      }
    );
  }

  dispararModalPollingPrograma() {
    let pollingModalRef: NgbModalRef;

    this._programasService
      .executarPollingFasesProgramas(this.programaAtual.id)
      .subscribe({
        next: (res: IPollingFases[]) => {
          this.fasesPollingAssinatura = res.map((fase) => {
            const descricao = acharDescricaoEtapaPorEtapa(fase.etapa);
            const status = getFaseStatus(fase.iniciada, fase.finalizada, fase.erro);

            return {
              ...fase,
              descricao,
              status,
            };
          });

          if (pollingModalRef) {
            pollingModalRef.componentInstance.fasesPolling = this.fasesPollingAssinatura;
          } else {
            this.statusAssinatura = PollingEtapasStatus.EM_ANDAMENTO;

            pollingModalRef = this._ngbModalService.open(
              PollingModalComponent,
              { centered: true }
            );

            pollingModalRef.componentInstance.fasesPolling = this.fasesPollingAssinatura;
            pollingModalRef.result.then(
              (resolve) => { },
              (result) => {
                if (result === 'fechar') {
                  pollingModalRef.close();
                }
              }
            );
          }
        },
        error: (err: any) => {
          console.error('Ocorreu um erro ao fazer o pooling.\n', err);
          this._toastService.showToast('error', 'Ocorreu um erro!');

          this.appStatus = AppStatus.EMPTY;
        },
        complete: () => {
          this._programasService
            .getById(this._programasService.idPrograma$.getValue())
            .subscribe({
              next: (programa: IPrograma) => {
                this._toastService.showToast('success', 'Assinado com sucesso!');
                const assinaturaUsuarioAtual = programa.programaAssinantesEdocsDto?.find((ass) => ass.idPessoa === this.usuarioAtual.idPessoa);

                if (
                  assinaturaUsuarioAtual &&
                  assinaturaUsuarioAtual.statusAssinatura === StatusAssinaturaPrograma.ASSINADO &&
                  assinaturaUsuarioAtual.dataAssinatura
                ) {
                  this.programaAtual = {
                    ...this.programaAtual,
                    ...programa,
                  };
  
                  this.atualizarAssinaturas(this.programaAtual);
                } else if (this.programaAtual.assinaturaUsuarioAtual) {
                  // Se o GET do programa não tiver retornado as assinaturas devidamente atualizadas, altera só o status local mesmo
                  this.programaAtual.assinaturaUsuarioAtual.statusAssinatura = StatusAssinaturaPrograma.ASSINADO;
                  this.programaAtual.assinaturaUsuarioAtual.dataAssinatura = new Date().toString();
                }

                this.statusAssinatura = PollingEtapasStatus.FINALIZADA;
                this.appStatus = AppStatus.SUCCESS;
              },
              error: (err) => {
                // Ocorreu um erro na chamada do GET de Programa, mas a essa altura a assinatura já foi feita com sucesso
                this._toastService.showToast('success', 'Assinado com sucesso!');
                if (this.programaAtual.assinaturaUsuarioAtual) {
                  this.programaAtual.assinaturaUsuarioAtual.statusAssinatura = StatusAssinaturaPrograma.ASSINADO;
                  this.programaAtual.assinaturaUsuarioAtual.dataAssinatura = new Date().toString();
                  this.statusAssinatura = PollingEtapasStatus.FINALIZADA;
                  this.appStatus = AppStatus.SUCCESS;
                }
              },
            });
        },
      });
  }
}
