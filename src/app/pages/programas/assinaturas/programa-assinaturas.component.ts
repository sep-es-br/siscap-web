import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProgramasService } from '../../../core/services/programas/programas.service';
import {
  IPrograma,
  IProgramaAssinaturasForm,
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
  getEtapasStatus,
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

  formPrograma: FormGroup = new FormGroup({
    tituloPrograma: new FormControl(''),
    siglaPrograma: new FormControl(''),
    orgaosPrograma: new FormControl(''),
    valorPrograma: new FormControl(''),
    dicsPrograma: new FormControl(''),
  });

  usuarioAtual!: UsuarioPerfilModel;

  fasesPollingAssinatura: Array<IPollingFases> = [];

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
          const nomesOrgaosExecutores = results[1]
            .filter((el) =>
              programaResponse.idOrgaoExecutorList.includes(el.id)
            )
            .map((el) => el.nome);
          const dicsPropostos = results[2]
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
              nomesOrgaosExecutores,
              listaDICSPropostos: dicsPropostos,
              demaisAssinaturas: [],
            };
          } else {
            const assinaturaUsuarioAtual =
              programaResponse.programaAssinantesEdocsDto.find(
                (ass) => ass.idPessoa === this.usuarioAtual.idPessoa
              );
            if (assinaturaUsuarioAtual) {
              const demaisAssinaturas =
                programaResponse.programaAssinantesEdocsDto.filter(
                  (ass) => ass.idPessoa !== assinaturaUsuarioAtual.idPessoa
                );

              this.programaAtual = {
                ...programaResponse,
                nomesOrgaosExecutores,
                listaDICSPropostos: dicsPropostos,
                assinaturaUsuarioAtual,
                demaisAssinaturas,
              };
            } else {
              this.programaAtual = {
                ...programaResponse,
                nomesOrgaosExecutores,
                listaDICSPropostos: dicsPropostos,
                demaisAssinaturas: programaResponse.programaAssinantesEdocsDto,
              };
            }
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
          });

          this.formPrograma.disable();

          this.appStatus = AppStatus.SUCCESS;
        },
      });
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
      textoPrincipal: 'Essa ação irá marcar a sua assinatura no Programa.',
    };

    modalRef.result.then(
      (resolve) => {},
      (result) => {
        if (result === 'confirmar') {
          this.appStatus = AppStatus.LOADING;

          this._toastService.showToast(
            'warning',
            'A sua assinatura está sendo processada!'
          );
          modalRef.close();

          this.dispararModalPollingPrograma();
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
            const status =
              getEtapasStatus.get(fase.etapa) ||
              PollingEtapasStatus.NAO_INICIADA;

            return {
              ...fase,
              descricao,
              status,
            };
          });

          if (!pollingModalRef) {
            pollingModalRef = this._ngbModalService.open(
              PollingModalComponent,
              { centered: true }
            );

            pollingModalRef.componentInstance.fasesPollingAssinatura =
              this.fasesPollingAssinatura;
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
          this._toastService.showToast('success', 'Assinado com sucesso!');

          this.appStatus = AppStatus.SUCCESS;
        },
      });
  }
}
