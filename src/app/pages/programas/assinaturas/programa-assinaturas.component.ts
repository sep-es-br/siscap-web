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

  constructor(
    private route: ActivatedRoute,
    private _programasService: ProgramasService,
    private readonly _opcoesDropdownService: OpcoesDropdownService
  ) {
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
          
          if (!programaResponse.programaAssinantesEdocsDto || programaResponse.programaAssinantesEdocsDto.length === 0) {
            assinaturasSanitized = [
              { id: 1, idPessoa: 1, idPrograma: programaResponse.id, nomePessoa: 'Fulano 1', statusAssinatura: StatusAssinaturaPrograma.PENDENTE, dataAssinatura: "2026-01-28T05:43:23", cargoPessoa: 'Gerente' },
              { id: 2, idPessoa: 1, idPrograma: programaResponse.id, nomePessoa: 'Fulano 2', statusAssinatura: StatusAssinaturaPrograma.ASSINADO, dataAssinatura: "", cargoPessoa: 'Sub-gerente' },
              { id: 3, idPessoa: 1, idPrograma: programaResponse.id, nomePessoa: 'Fulano 3', statusAssinatura: StatusAssinaturaPrograma.PENDENTE, dataAssinatura: "", cargoPessoa: 'Sub-sub-gerente' },
            ];
          } else {
            console.error("Precisa remover o mockup acima");

            const assinaturas = programaResponse.programaAssinantesEdocsDto;  
            assinaturasSanitized = assinaturas.map((assinatura) => {
              const pessoaObj = results[3].find((pessoa) => pessoa.id === assinatura.idPessoa);
              if (pessoaObj) return { ...assinatura, cargoPessoa: pessoaObj.papelPrioritario };

              return { ...assinatura, cargoPessoa: '' };
            });
          }

          this.programaAtual = {
            ...programaResponse,
            nomesOrgaosExecutores: nomesOrgaosExecutores,
            listaDICSPropostos: dicsPropostos,
            assinaturas: assinaturasSanitized,
          };

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
}
