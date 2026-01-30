import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProgramasService } from '../../../core/services/programas/programas.service';
import {
  IPrograma,
  IProgramaAssinaturaSanitized,
  IProgramaAssinaturasForm,
  StatusAssinaturaPrograma,
} from '../../../core/interfaces/programa.interface';
import { OpcoesDropdownService } from '../../../core/services/opcoes-dropdown/opcoes-dropdown.service';
import { TipoOrganizacaoEnum } from '../../../core/enums/tipo-organizacao.enum';
import { forkJoin } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { UsuarioService } from '../../../core/services/usuario/usuario.service';
import { UsuarioPerfilModel } from '../../../core/models/usuario.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationModalComponent } from '../../../shared/templates/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'siscap-programa-assinaturas',
  templateUrl: './programa-assinaturas.component.html',
  styleUrl: './programa-assinaturas.component.scss',
})
export class ProgramaAssinaturasComponent {
  isLoading: boolean = true;

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
  ) {
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

      const pessoasSubscription$ =
        this._opcoesDropdownService.getOpcoesPessoas();

      forkJoin([
        programaSubscription$,
        organizacoesSubscription$,
        projetosSubscription$,
        pessoasSubscription$,
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

          let assinaturasSanitized: Array<IProgramaAssinaturaSanitized>;

          if (
            !programaResponse.programaAssinantesEdocsDto ||
            programaResponse.programaAssinantesEdocsDto.length === 0
          ) {
            assinaturasSanitized = [
              {
                id: 1,
                idPessoa: 1,
                idPrograma: programaResponse.id,
                nomePessoa: 'Fulano 1',
                statusAssinatura: StatusAssinaturaPrograma.PENDENTE,
                dataAssinatura: '',
                cargoPessoa: 'Gerente',
              },
              {
                id: 2,
                idPessoa: 1,
                idPrograma: programaResponse.id,
                nomePessoa: 'Fulano 2',
                statusAssinatura: StatusAssinaturaPrograma.ASSINADO,
                dataAssinatura: '2026-01-28T05:43:23',
                cargoPessoa: 'Sub-gerente',
              },
              {
                id: 3,
                idPessoa: 1,
                idPrograma: programaResponse.id,
                nomePessoa: 'Fulano 3',
                statusAssinatura: StatusAssinaturaPrograma.ERRO,
                dataAssinatura: '',
                cargoPessoa: 'Sub-sub-gerente',
              },
              {
                id: 4,
                idPessoa: 359,
                idPrograma: programaResponse.id,
                nomePessoa: 'Ricardo Souza',
                statusAssinatura: StatusAssinaturaPrograma.PENDENTE,
                dataAssinatura: '',
                cargoPessoa: 'Desenvolvedor Fullstack',
              },
            ];
          } else {
            console.error('Precisa remover o mockup acima');

            const assinaturas = programaResponse.programaAssinantesEdocsDto;
            assinaturasSanitized = assinaturas.map((assinatura) => {
              const pessoaObj = results[3].find(
                (pessoa) => pessoa.id === assinatura.idPessoa
              );
              if (pessoaObj) {
                return {
                  ...assinatura,
                  cargoPessoa: pessoaObj.papelPrioritario,
                  isAssinado:
                    assinatura.statusAssinatura ===
                    StatusAssinaturaPrograma.ASSINADO,
                };
              }

              return {
                ...assinatura,
                cargoPessoa: '',
                isAssinado:
                  assinatura.statusAssinatura ===
                  StatusAssinaturaPrograma.ASSINADO,
              };
            });
          }

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

          console.log('this.programaAtual: ', this.programaAtual);
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
            valorPrograma: `R$ ${this.programaAtual.valor.quantia}`,
            dicsPrograma: this.programaAtual.listaDICSPropostos,
          });

          this.formPrograma.disable();

          this.isLoading = false;
        },
      });
    }
  }

  exportarPrograma() {
    this._programasService.exportById(
      this.programaAtual.id,
      this.programaAtual.titulo
    );
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
          this._programasService
            .assinarAutorizacaoPrograma(this.programaAtual.id, this.usuarioAtual.subNovo)
            .subscribe({
              next: (res) => {
                // Falta testar a resposta da API
                console.log('res: ', res);
              },
              error: (err) => {},
            });
        } //  else if (result === 'cancelar') {}
      }
    );
  }
}
