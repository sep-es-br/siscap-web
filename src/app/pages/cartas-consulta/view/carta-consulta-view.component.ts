import { Component, OnDestroy, OnInit } from '@angular/core';

import { map, Observable, Subscription, switchMap, tap } from 'rxjs';

import { CartasConsultaService } from '../../../core/services/cartas-consulta/cartas-consulta.service';
import { ProjetosService } from '../../../core/services/projetos/projetos.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb/breadcrumb.service';
import { NavegacaoService } from '../../../core/services/navegacao/navegacao.service';

import { CartaConsultaDetalhesModel } from '../../../core/models/carta-consulta.model';

import { TBotaoAcao } from '../../../shared/components/botao/botao.config';

import { ICartaConsultaDetalhes } from '../../../core/interfaces/carta-consulta.interface';

import {
  BreadcrumbAcoesEnum,
  BreadcrumbContextoEnum,
} from '../../../core/enums/breadcrumb.enum';

import { getSimboloMoeda } from '../../../core/utils/functions';

@Component({
  selector: 'siscap-carta-consulta-view',
  standalone: false,
  templateUrl: './carta-consulta-view.component.html',
  styleUrl: './carta-consulta-view.component.scss',
})
export class CartaConsultaViewComponent implements OnInit, OnDestroy {
  private readonly _subscription: Subscription = new Subscription();

  private readonly _getCartaConsultaDetalhes$: Observable<ICartaConsultaDetalhes>;

  public cartaConsultaDetalhes: CartaConsultaDetalhesModel =
    new CartaConsultaDetalhesModel();

  public getSimboloMoeda: (moeda: string | undefined | null) => string =
    getSimboloMoeda;

  constructor(
    private readonly _cartasConsultaService: CartasConsultaService,
    private readonly _projetosService: ProjetosService,
    private readonly _breadcrumbService: BreadcrumbService,
    private readonly _navegacaoService: NavegacaoService
  ) {
    this._getCartaConsultaDetalhes$ =
      this._cartasConsultaService.idCartaConsultaDetalhes$.pipe(
        switchMap((idCartaConsultaDetalhes: number) =>
          this._cartasConsultaService.buscarDetalhesCartaConsulta(
            idCartaConsultaDetalhes
          )
        ),
        map<ICartaConsultaDetalhes, CartaConsultaDetalhesModel>(
          (response: ICartaConsultaDetalhes) =>
            new CartaConsultaDetalhesModel(response)
        ),
        tap((cartaConsultaDetalhesModel: CartaConsultaDetalhesModel) => {
          this.cartaConsultaDetalhes = cartaConsultaDetalhesModel;

          const botoesAcaoPropriedades = this.cartaConsultaDetalhes.prospectado
            ? this._cartasConsultaService.gerarBotoesAcaoVizualizarDetalhesProspeccaoRealizada()
            : this._cartasConsultaService.gerarBotoesAcaoVizualizarDetalhes();

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
    this._subscription.add(this._getCartaConsultaDetalhes$.subscribe());
  }

  public baixarDIC(idProjetoProposto: number): void {
    this._projetosService.baixarDIC(idProjetoProposto);
  }

  private executarAcaoBreadcrumb(acao: TBotaoAcao): void {
    switch (acao) {
      case BreadcrumbAcoesEnum.Editar:
        this._cartasConsultaService.idCartaConsulta$.next(
          this.cartaConsultaDetalhes.id
        );

        this._navegacaoService.navegacaoSimples(
          BreadcrumbContextoEnum.CartasConsulta,
          BreadcrumbAcoesEnum.Editar
        );
        break;

      case BreadcrumbAcoesEnum.Cancelar:
        this._navegacaoService.navegacaoSimples(
          BreadcrumbContextoEnum.CartasConsulta
        );
        break;

      default:
        break;
    }
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
    this._cartasConsultaService.idCartaConsultaDetalhes$.next(0);
    this._breadcrumbService.listaBotaoAcaoPropriedades$.next([]);
  }
}
