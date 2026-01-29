import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProgramasService } from '../../../core/services/programas/programas.service';
import { IProjetoPropostoOpcoesDropdown } from '../../../core/interfaces/opcoes-dropdown.interface';
import { IPrograma, IProgramaAssinaturas } from '../../../core/interfaces/programa.interface';
import { OpcoesDropdownService } from '../../../core/services/opcoes-dropdown/opcoes-dropdown.service';
import { TipoOrganizacaoEnum } from '../../../core/enums/tipo-organizacao.enum';
import { forkJoin, Subscription } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'siscap-programa-assinaturas',
  templateUrl: './programa-assinaturas.component.html',
  styleUrl: './programa-assinaturas.component.scss'
})
export class ProgramaAssinaturasComponent {
  isLoading: boolean = true;

  programaAtual!:  IProgramaAssinaturas;

  formPrograma: FormGroup = new FormGroup({
    tituloPrograma: new FormControl(''),
    siglaPrograma: new FormControl(''),
    orgaosPrograma: new FormControl(''),
  })

  constructor(
    private route: ActivatedRoute,
    private _programasService: ProgramasService,
    private readonly _opcoesDropdownService: OpcoesDropdownService,
  ) {
    const idPrograma = this.route.snapshot.paramMap.get('id');
    if (idPrograma) {
      const programaSubscription$ = this._programasService.getById(Number(idPrograma));
      const organizacoesSubscription$ = this._opcoesDropdownService.getOpcoesOrganizacoes(TipoOrganizacaoEnum.Secretaria);
      const projetosSubscription$ = this._opcoesDropdownService.getOpcoesProjetosPropostos();

      forkJoin([programaSubscription$, organizacoesSubscription$, projetosSubscription$]).subscribe({
        next: (results) => {
          const programaResponse: IPrograma = results[0];
          const nomesOrgaosExecutores = results[1].filter((el) => programaResponse.idOrgaoExecutorList.includes(el.id)).map((el) => el.nome);
          const dicsPropostos = results[2].filter((el) => programaResponse.idProjetoPropostoList.includes(el.id)).map((el) => el.nome);

          this.programaAtual = {
            ...programaResponse,
            nomesOrgaosExecutores: nomesOrgaosExecutores,
            listaDICSPropostos: dicsPropostos,
          };
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
          });

          this.isLoading = false;
        },
      });
    }
  }
}
