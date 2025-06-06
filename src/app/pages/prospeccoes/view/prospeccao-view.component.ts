import { Component, OnDestroy, OnInit } from '@angular/core';

import { finalize, map, Observable, Subscription, switchMap, tap } from 'rxjs';

import { LoadingService } from '../../../core/services/loading/loading.service';
import { ProspeccoesService } from '../../../core/services/prospeccoes/prospeccoes.service';
import { ProjetosService } from '../../../core/services/projetos/projetos.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb/breadcrumb.service';
import { ToastService } from '../../../core/services/toast/toast.service';
import { NavegacaoService } from '../../../core/services/navegacao/navegacao.service';

import { IProspeccaoDetalhes } from '../../../core/interfaces/prospeccao.interface';

import {
  ProspeccaoDetalhesModel,
  ProspeccaoOrganizacaoDetalhesModel,
} from '../../../core/models/prospeccao.model';

import { StatusProspeccaoEnum } from '../../../core/enums/status-prospeccao.enum';
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
  private readonly _subscription: Subscription = new Subscription();

  private readonly _getProspeccaoDetalhes$: Observable<IProspeccaoDetalhes>;

  public prospeccaoDetalhes: ProspeccaoDetalhesModel =
    new ProspeccaoDetalhesModel();

  public organizacaoProspectoraDetalhes: ProspeccaoOrganizacaoDetalhesModel =
    new ProspeccaoOrganizacaoDetalhesModel();

  public organizacaoProspectadaDetalhes: ProspeccaoOrganizacaoDetalhesModel =
    new ProspeccaoOrganizacaoDetalhesModel();

  public getSimboloMoeda: (moeda: string | undefined | null) => string =
    getSimboloMoeda;

  constructor(
    public loadingService: LoadingService,
    private readonly _prospeccoesService: ProspeccoesService,
    private readonly _projetosService: ProjetosService,
    private readonly _breadcrumbService: BreadcrumbService,
    private readonly _toastService: ToastService,
    private readonly _navegacaoService: NavegacaoService
  ) {
    this._getProspeccaoDetalhes$ =
      this._prospeccoesService.idProspeccaoDetalhes$.pipe(
        switchMap((idProspeccao: number) =>
          this._prospeccoesService.buscarDetalhesProspeccao(idProspeccao)
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

          const botoesAcaoPropriedades =
            this.prospeccaoDetalhes.statusProspeccao ===
            StatusProspeccaoEnum.Prospectado
              ? this._prospeccoesService.gerarBotoesAcaoVisualizarDetalhesProspeccaoRealizada()
              : this._prospeccoesService.gerarBotoesAcaoVisualizarDetalhes();

          this._breadcrumbService.listaBotaoAcaoPropriedades$.next(
            botoesAcaoPropriedades
          );
        })
      );

    this._subscription.add(
      this._breadcrumbService.executarAcaoBotao$.subscribe((acao) =>
        this.executarAcaoBreadcrumb(acao)
      )
    );
  }

  ngOnInit(): void {
    this._subscription.add(this._getProspeccaoDetalhes$.subscribe());
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
      case BreadcrumbAcoesEnum.Editar:
        this._prospeccoesService.idProspeccao$.next(this.prospeccaoDetalhes.id);

        this._navegacaoService.navegacaoSimples(
          BreadcrumbContextoEnum.Prospeccao,
          BreadcrumbAcoesEnum.Editar
        );
        break;

      case BreadcrumbAcoesEnum.Cancelar:
        this._navegacaoService.navegacaoSimples(
          BreadcrumbContextoEnum.Prospeccao
        );
        break;

      case BreadcrumbAcoesEnum.Prospectar:
        this.enviarEmailProspeccao();
        break;

      default:
        break;
    }
  }

  private enviarEmailProspeccao(): void {
    this.loadingService.iniciarProcessamento();

    this._prospeccoesService
      .enviarEmailProspeccao(this.prospeccaoDetalhes.id)
      .pipe(
        tap((response) => {
          this._toastService.showToast('success', response);
          this.executarAcaoBreadcrumb(BreadcrumbAcoesEnum.Cancelar);
        }),
        finalize(() => this.loadingService.finalizarProcessamento())
      )
      .subscribe();

    // setTimeout(() => {
    //   this.loadingService.finalizarProcessamento();
    // }, 5000);
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
    this._prospeccoesService.idProspeccaoDetalhes$.next(0);
    this._breadcrumbService.listaBotaoAcaoPropriedades$.next([]);
  }
}
