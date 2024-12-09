import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { map, Observable, Subscription, switchMap, tap } from 'rxjs';

import { ProspeccoesService } from '../../../core/services/prospeccoes/prospeccoes.service';
import { ProjetosService } from '../../../core/services/projetos/projetos.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb/breadcrumb.service';

import { IProspeccaoDetalhes } from '../../../core/interfaces/prospeccao.interface';

import {
  ProspeccaoDetalhesModel,
  ProspeccaoOrganizacaoDetalhesModel,
} from '../../../core/models/prospeccao.model';

import { getSimboloMoeda } from '../../../core/utils/functions';

@Component({
  selector: 'siscap-prospeccao-view',
  standalone: false,
  templateUrl: './prospeccao-view.component.html',
  styleUrl: './prospeccao-view.component.scss',
})
export class ProspeccaoViewComponent implements OnInit, OnDestroy {
  private _getProspeccaoDetalhes$: Observable<IProspeccaoDetalhes>;

  private _subscription: Subscription = new Subscription();

  public prospeccaoDetalhes: ProspeccaoDetalhesModel =
    new ProspeccaoDetalhesModel();

  public organizacaoProspectoraDetalhes: ProspeccaoOrganizacaoDetalhesModel =
    new ProspeccaoOrganizacaoDetalhesModel();

  public organizacaoProspectadaDetalhes: ProspeccaoOrganizacaoDetalhesModel =
    new ProspeccaoOrganizacaoDetalhesModel();

  public getSimboloMoeda: (moeda: string | undefined | null) => string =
    getSimboloMoeda;

  constructor(
    private _prospeccoesService: ProspeccoesService,
    private _projetosService: ProjetosService,
    private _breadcrumbService: BreadcrumbService,
    private _router: Router
  ) {
    this._getProspeccaoDetalhes$ = this._prospeccoesService.idProspeccao$.pipe(
      switchMap((idProspeccao: number) =>
        this._prospeccoesService.getProspeccaoDetalhes(idProspeccao)
      ),
      map<IProspeccaoDetalhes, ProspeccaoDetalhesModel>(
        (response: IProspeccaoDetalhes) => new ProspeccaoDetalhesModel(response)
      ),
      tap((prospeccaoDetalhesModel: ProspeccaoDetalhesModel) => {
        this.prospeccaoDetalhes = prospeccaoDetalhesModel;
        this.organizacaoProspectoraDetalhes =
          prospeccaoDetalhesModel.organizacaoProspectoraDetalhes;
        this.organizacaoProspectadaDetalhes =
          prospeccaoDetalhesModel.organizacaoProspectadaDetalhes;
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

  private executarAcaoBreadcrumb(acao: string): void {
    switch (acao) {
      case 'editar':
        this._router.navigate(['main', 'prospeccao', 'editar']);
        break;

      case 'prospectar':
        console.log('INICIAR PROCESSO DE PROSPECCAO');
        break;

      default:
        break;
    }
  }

  ngOnDestroy(): void {
    this._prospeccoesService.idProspeccao$.next(0);
    this._subscription.unsubscribe();
  }
}
