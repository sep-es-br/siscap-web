import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { map, Observable, Subscription, switchMap, tap } from 'rxjs';

import { CartasConsultaService } from '../../../core/services/cartas-consulta/cartas-consulta.service';
import { ProjetosService } from '../../../core/services/projetos/projetos.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb/breadcrumb.service';

import { CartaConsultaDetalhesModel } from '../../../core/models/carta-consulta.model';

import { ICartaConsultaDetalhes } from '../../../core/interfaces/carta-consulta.interface';
import { IBreadcrumbBotaoAcao } from '../../../core/interfaces/breadcrumb.interface';

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
  private readonly _getCartaConsultaDetalhes$: Observable<ICartaConsultaDetalhes>;

  private readonly _subscription: Subscription = new Subscription();

  public cartaConsultaDetalhes: CartaConsultaDetalhesModel =
    new CartaConsultaDetalhesModel();

  public getSimboloMoeda: (moeda: string | undefined | null) => string =
    getSimboloMoeda;

  constructor(
    private readonly _cartasConsultaService: CartasConsultaService,
    private readonly _projetosService: ProjetosService,
    private readonly _breadcrumbService: BreadcrumbService,
    private readonly _router: Router
  ) {
    this._getCartaConsultaDetalhes$ =
      this._cartasConsultaService.idCartaConsultaDetalhes$.pipe(
        switchMap((idCartaConsultaDetalhes: number) =>
          this._cartasConsultaService.getCartaConsultaDetalhes(
            idCartaConsultaDetalhes
          )
        ),
        map<ICartaConsultaDetalhes, CartaConsultaDetalhesModel>(
          (response: ICartaConsultaDetalhes) =>
            new CartaConsultaDetalhesModel(response)
        ),
        tap((cartaConsultaDetalhesModel: CartaConsultaDetalhesModel) => {
          this.cartaConsultaDetalhes = cartaConsultaDetalhesModel;

          this.montarBotoesAcaoBreadcrumb(
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
    this._subscription.add(this._getCartaConsultaDetalhes$.subscribe());
  }

  public preencherIdAteQuatroDigitos(id: number): string {
    const idAsString = id.toString();

    return idAsString.length < 4 ? idAsString.padStart(4, '0') : idAsString;
  }

  public baixarDIC(idProjetoProposto: number): void {
    this._projetosService.baixarDIC(idProjetoProposto);
  }

  private montarBotoesAcaoBreadcrumb(...acoes: Array<string>): void {
    const botoesAcao: IBreadcrumbBotaoAcao = {
      botoes: acoes,
      contexto: BreadcrumbContextoEnum.CartasConsulta,
    };

    this._breadcrumbService.breadcrumbBotoesAcao$.next(botoesAcao);
  }

  private executarAcaoBreadcrumb(acao: string): void {
    switch (acao) {
      case BreadcrumbAcoesEnum.Editar:
        this._cartasConsultaService.idCartaConsulta$.next(
          this.cartaConsultaDetalhes.id
        );
        this._router.navigate(['main', 'cartasconsulta', 'editar']);
        break;

      case BreadcrumbAcoesEnum.Cancelar:
        this._router.navigate(['main', 'cartasconsulta']);
        break;

      default:
        break;
    }
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
    this._cartasConsultaService.idCartaConsultaDetalhes$.next(0);
    this._breadcrumbService.limparBotoesAcao();
  }
}
