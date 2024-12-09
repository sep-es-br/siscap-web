import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { map, Observable, Subscription, switchMap, tap } from 'rxjs';

import { CartasConsultaService } from '../../../core/services/cartas-consulta/cartas-consulta.service';
import { ProjetosService } from '../../../core/services/projetos/projetos.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb/breadcrumb.service';

import { ICartaConsultaDetalhes } from '../../../core/interfaces/carta-consulta.interface';

import { CartaConsultaDetalhesModel } from '../../../core/models/carta-consulta.model';

import { getSimboloMoeda } from '../../../core/utils/functions';

@Component({
  selector: 'siscap-carta-consulta-view',
  standalone: false,
  templateUrl: './carta-consulta-view.component.html',
  styleUrl: './carta-consulta-view.component.scss',
})
export class CartaConsultaViewComponent implements OnInit, OnDestroy {
  private _getCartaConsultaDetalhes$: Observable<ICartaConsultaDetalhes>;

  private _subscription: Subscription = new Subscription();

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
      this._cartasConsultaService.idCartaConsulta$.pipe(
        switchMap((idCartaConsulta: number) =>
          this._cartasConsultaService.getCartaConsultaDetalhes(idCartaConsulta)
        ),
        map<ICartaConsultaDetalhes, CartaConsultaDetalhesModel>(
          (response: ICartaConsultaDetalhes) =>
            new CartaConsultaDetalhesModel(response)
        ),
        tap(
          (cartaConsultaDetalhesModel: CartaConsultaDetalhesModel) =>
            (this.cartaConsultaDetalhes = cartaConsultaDetalhesModel)
        )
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

  private executarAcaoBreadcrumb(acao: string): void {
    switch (acao) {
      case 'editar':
        this._router.navigate(['main', 'cartasconsulta', 'editar']);
        break;

      default:
        break;
    }
  }

  ngOnDestroy(): void {
    this._cartasConsultaService.idCartaConsulta$.next(0);
    this._subscription.unsubscribe();
  }
}
