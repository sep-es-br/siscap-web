import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProgramasService } from '../../../core/services/programas/programas.service';
import {
  IPrograma,
  IProgramaAssinatura,
  IProgramaAssinaturasForm,
} from '../../../core/interfaces/programa.interface';
import { OpcoesDropdownService } from '../../../core/services/opcoes-dropdown/opcoes-dropdown.service';
import { TipoOrganizacaoEnum } from '../../../core/enums/tipo-organizacao.enum';
import { forkJoin } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { UsuarioService } from '../../../core/services/usuario/usuario.service';
import { UsuarioPerfilModel } from '../../../core/models/usuario.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationModalComponent } from '../../../shared/templates/confirmation-modal/confirmation-modal.component';
import { AppStatus } from '../../../core/enums/app-status.enum';
import { ToastService } from '../../../core/services/toast/toast.service';
import { RequestStatus } from '../../../core/enums/request-status.enum';

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

  constructor(
    private route: ActivatedRoute,
    private _programasService: ProgramasService,
    private readonly _opcoesDropdownService: OpcoesDropdownService,
    private readonly _usuarioService: UsuarioService,
    private readonly _ngbModalService: NgbModal,
    private readonly _toastService: ToastService,
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

          let assinaturasSanitized: Array<IProgramaAssinatura>;

          if (
            !programaResponse.programaAssinantesEdocsDto ||
            programaResponse.programaAssinantesEdocsDto.length === 0
          ) {
            this.appStatus = AppStatus.ERROR;
            console.error('Por algum motivo não há lista de assinantes!\n programaAssinantesEdocsDto: ', programaResponse.programaAssinantesEdocsDto);
            this._toastService.showToast(
              'warning',
              'A lista de assinantes não existe ou está vazia! É necessário solicitar as Autorizações primeiro.',
            );

            this.programaAtual = {
              ...programaResponse,
              nomesOrgaosExecutores,
              listaDICSPropostos: dicsPropostos,
              demaisAssinaturas: [],
            };
          } else {
            assinaturasSanitized = programaResponse.programaAssinantesEdocsDto.map((assinatura) => {
              return {
                ...assinatura,
                cargoPessoa: '',
              };
            });

            const assinaturaUsuarioAtual = assinaturasSanitized.find((ass) => ass.idPessoa === this.usuarioAtual.idPessoa);
            if (assinaturaUsuarioAtual) {
              assinaturasSanitized = assinaturasSanitized.filter((ass) => ass.idPessoa !== this.usuarioAtual.idPessoa);

              this.programaAtual = {
                ...programaResponse,
                nomesOrgaosExecutores,
                listaDICSPropostos: dicsPropostos,
                assinaturaUsuarioAtual,
                demaisAssinaturas: assinaturasSanitized,
              };
            } else {
              this.programaAtual = {
                ...programaResponse,
                nomesOrgaosExecutores,
                listaDICSPropostos: dicsPropostos,
                demaisAssinaturas: assinaturasSanitized,
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
            valorPrograma: `R$ ${this.programaAtual.valor.quantia.toLocaleString('pt-BR')}`,
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

    modalRef.componentInstance.conteudo =
      'Essa ação irá marcar a sua assinatura no Programa.';

    modalRef.result.then(
      (resolve) => {},
      (result) => {
        if (result === 'confirmar') {
          this.appStatus = AppStatus.LOADING;

          this._programasService
            .assinarAutorizacaoPrograma(this.programaAtual.id, this.usuarioAtual.subNovo)
            .subscribe({
              next: (res) => {
                this.appStatus = AppStatus.SUCCESS;

                this._toastService.showToast(
                  'success',
                  'Assinado com sucesso!',
                );
              },
              error: (err) => {
                console.error('Ocorreu um erro ao tentar assinar a autorização!\n', err);
                this.appStatus = AppStatus.ERROR;
              },
            });
        }
      }
    );
  }
}
