import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { map, Observable, Subscription, switchMap, tap } from 'rxjs';

import { ProspeccoesService } from '../../../core/services/prospeccoes/prospeccoes.service';
import { ProjetosService } from '../../../core/services/projetos/projetos.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb/breadcrumb.service';

import { IProspeccaoDetalhes } from '../../../core/interfaces/prospeccao.interface';
import { IBreadcrumbBotaoAcao } from '../../../core/interfaces/breadcrumb.interface';

import {
  ProspeccaoDetalhesModel,
  ProspeccaoOrganizacaoDetalhesModel,
} from '../../../core/models/prospeccao.model';

import {
  BreadcrumbAcoesEnum,
  BreadcrumbContextoEnum,
} from '../../../core/enums/breadcrumb.enum';

import { getSimboloMoeda } from '../../../core/utils/functions';

@Component({
  selector: 'siscap-prospeccao-view',
  standalone: false,
  templateUrl: './prospeccao-view.component.html',
  styleUrl: './prospeccao-view.component.scss',
})
export class ProspeccaoViewComponent implements OnInit, OnDestroy {
  private readonly _getProspeccaoDetalhes$: Observable<IProspeccaoDetalhes>;

  private readonly _subscription: Subscription = new Subscription();

  public prospeccaoDetalhes: ProspeccaoDetalhesModel =
    new ProspeccaoDetalhesModel();

  public organizacaoProspectoraDetalhes: ProspeccaoOrganizacaoDetalhesModel =
    new ProspeccaoOrganizacaoDetalhesModel();

  public organizacaoProspectadaDetalhes: ProspeccaoOrganizacaoDetalhesModel =
    new ProspeccaoOrganizacaoDetalhesModel();

  public getSimboloMoeda: (moeda: string | undefined | null) => string =
    getSimboloMoeda;

  constructor(
    private readonly _prospeccoesService: ProspeccoesService,
    private readonly _projetosService: ProjetosService,
    private readonly _breadcrumbService: BreadcrumbService,
    private readonly _router: Router
  ) {
    this._getProspeccaoDetalhes$ =
      this._prospeccoesService.idProspeccaoDetalhes$.pipe(
        switchMap((idProspeccao: number) =>
          this._prospeccoesService.getProspeccaoDetalhes(idProspeccao)
        ),
        map<IProspeccaoDetalhes, ProspeccaoDetalhesModel>(
          (response: IProspeccaoDetalhes) =>
            new ProspeccaoDetalhesModel(response)
        ),
        tap((prospeccaoDetalhesModel: ProspeccaoDetalhesModel) => {
          this.prospeccaoDetalhes = prospeccaoDetalhesModel;
          this.organizacaoProspectoraDetalhes =
            prospeccaoDetalhesModel.organizacaoProspectoraDetalhes;
          this.organizacaoProspectadaDetalhes =
            prospeccaoDetalhesModel.organizacaoProspectadaDetalhes;

          this.montarBotoesAcaoBreadcrumb(
            BreadcrumbAcoesEnum.Prospectar,
            BreadcrumbAcoesEnum.Editar,
            BreadcrumbAcoesEnum.Cancelar
          );
        })
      );

    this._subscription.add(
      this._breadcrumbService.acaoBreadcrumb$.subscribe((acao) =>
        this.executarAcaoBreadcrumb(acao)
      )
    );
  }

  ngOnInit(): void {
    this._subscription.add(this._getProspeccaoDetalhes$.subscribe());
  }

  public preencherIdAteQuatroDigitos(id: number): string {
    const idAsString = id.toString();

    return idAsString.length < 4 ? idAsString.padStart(4, '0') : idAsString;
  }

  public formatarEndereco(
    cidade: string,
    estado: string,
    pais: string
  ): string {
    return `${cidade}, ${estado}, ${pais}`;
  }

  public baixarDIC(idProjetoProposto: number): void {
    this._projetosService.baixarDIC(idProjetoProposto);
  }

  private montarBotoesAcaoBreadcrumb(...acoes: Array<string>): void {
    const botoesAcao: IBreadcrumbBotaoAcao = {
      botoes: acoes,
      contexto: BreadcrumbContextoEnum.Prospeccao,
    };

    this._breadcrumbService.breadcrumbBotoesAcao$.next(botoesAcao);
  }

  private executarAcaoBreadcrumb(acao: string): void {
    switch (acao) {
      case BreadcrumbAcoesEnum.Editar:
        this._prospeccoesService.idProspeccao$.next(this.prospeccaoDetalhes.id);
        this._router.navigate(['main', 'prospeccao', 'editar']);
        break;

      case BreadcrumbAcoesEnum.Cancelar:
        this._router.navigate(['main', 'prospeccao']);
        break;

      case BreadcrumbAcoesEnum.Prospectar:
        console.log('INICIAR PROCESSO DE PROSPECCAO');
        break;

      default:
        break;
    }
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
    this._prospeccoesService.idProspeccaoDetalhes$.next(0);
    this._breadcrumbService.limparBotoesAcao();
  }
}
