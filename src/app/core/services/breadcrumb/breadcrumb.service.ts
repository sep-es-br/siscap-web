import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

import { filter, first, map, Observable, repeat, Subject, tap } from 'rxjs';

import { BotaoPropriedadesModel } from '../../../shared/components/botao/botao.model';

import { TBotaoAcao } from '../../../shared/components/botao/botao.config';

import { IBreadcrumbItem } from '../../interfaces/breadcrumb.interface';

import {
  BREADCRUMB_COLECAO_CAMINHO_TITULO,
  BREADCRUMB_LISTA_CAMINHOS_ESPECIFICOS,
  BREADCRUMB_LISTA_CAMINHOS_EXCLUSAO,
  BREADCRUMB_LISTA_CAMINHOS_FILHOS,
  BREADCRUMB_LISTA_CAMINHOS_PRINCIPAIS,
} from '../../utils/constants';

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService {
  private readonly _mapCaminhoTitulo: Record<string, string> =
    BREADCRUMB_COLECAO_CAMINHO_TITULO;

  private readonly _breadcrumbItemPaginaPrincipal: IBreadcrumbItem = {
    titulo: this._mapCaminhoTitulo['home'],
    caminho: 'home',
  };

  private readonly _listaItemsBreadcrumb$: Subject<Array<IBreadcrumbItem>> =
    new Subject<Array<IBreadcrumbItem>>();

  public get listaItemsBreadcrumb$(): Subject<Array<IBreadcrumbItem>> {
    return this._listaItemsBreadcrumb$;
  }

  private readonly _listaBotaoAcaoPropriedades$: Subject<
    Array<BotaoPropriedadesModel>
  > = new Subject<Array<BotaoPropriedadesModel>>();

  public get listaBotaoAcaoPropriedades$(): Subject<
    Array<BotaoPropriedadesModel>
  > {
    return this._listaBotaoAcaoPropriedades$;
  }

  private readonly _executarAcaoBotao$: Subject<TBotaoAcao> =
    new Subject<TBotaoAcao>();

  public get executarAcaoBotao$(): Subject<TBotaoAcao> {
    return this._executarAcaoBotao$;
  }

  constructor(private readonly _router: Router) {
    this.montarBreadcrumb().subscribe();
  }

  private montarBreadcrumb(): Observable<Array<IBreadcrumbItem>> {
    return this._router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      first(),
      map<NavigationEnd, Array<IBreadcrumbItem>>((navigationEndEvent) =>
        this.tratarCaminhosBreadcrumb(navigationEndEvent.urlAfterRedirects)
      ),
      repeat({ delay: () => this.montarBreadcrumb() }),
      tap((breadcrumbItemArray) =>
        this.listaItemsBreadcrumb$.next(breadcrumbItemArray)
      )
    );
  }

  private tratarCaminhosBreadcrumb(url: string): Array<IBreadcrumbItem> {
    const urlTratada = url
      .split('/')
      .filter((caminho) => !this.filtrarCaminhosExclusao(caminho));

    const breadcrumbItemArray = urlTratada.map((caminho, index) => {
      if (this.filtrarCaminhosPrincipais(caminho)) {
        return this.tratarCaminhoPrincipal(caminho);
      }

      return this.filtrarCaminhosFilhos(caminho)
        ? this.tratarCaminhoFilho(caminho, urlTratada[index - 1])
        : this.tratarCaminhoCasoEspecifico(caminho, urlTratada[index - 1]);
    });

    if (
      !this.verificarPossuiBreadcrumbItemPaginaPrincipal(breadcrumbItemArray)
    ) {
      breadcrumbItemArray.unshift(this._breadcrumbItemPaginaPrincipal);
    }

    return breadcrumbItemArray;
  }

  private filtrarCaminhosExclusao(caminho: string): boolean {
    return BREADCRUMB_LISTA_CAMINHOS_EXCLUSAO.includes(caminho);
  }

  private filtrarCaminhosPrincipais(caminho: string): boolean {
    return BREADCRUMB_LISTA_CAMINHOS_PRINCIPAIS.includes(caminho);
  }

  private filtrarCaminhosFilhos(caminho: string): boolean {
    return BREADCRUMB_LISTA_CAMINHOS_FILHOS.includes(caminho);
  }

  private tratarCaminhoPrincipal(caminho: string): IBreadcrumbItem {
    return {
      titulo: this._mapCaminhoTitulo[caminho],
      caminho: caminho,
    };
  }

  private tratarCaminhoFilho(
    caminho: string,
    caminhoAnterior: string
  ): IBreadcrumbItem {
    return {
      titulo: this._mapCaminhoTitulo[caminhoAnterior + caminho],
      caminho: caminhoAnterior + '/' + caminho,
    };
  }

  private tratarCaminhoCasoEspecifico(
    caminho: string,
    caminhoAnterior: string
  ): IBreadcrumbItem {
    const itemCasoEspecifico = BREADCRUMB_LISTA_CAMINHOS_ESPECIFICOS.find(
      (casoEspecifico) =>
        casoEspecifico.caminho === caminho &&
        casoEspecifico.contexto === caminhoAnterior
    );

    if (!itemCasoEspecifico) {
      throw new Error('Caso específico não mapeado para o caminho: ' + caminho);
    }

    return {
      titulo:
        this._mapCaminhoTitulo[
          itemCasoEspecifico.contexto +
            itemCasoEspecifico.caminho.replace(/[^\w]/g, '')
        ],
      caminho: itemCasoEspecifico.contexto + '/' + caminho,
    };
  }

  private verificarPossuiBreadcrumbItemPaginaPrincipal(
    breadcrumbItemArray: Array<IBreadcrumbItem>
  ): boolean {
    return breadcrumbItemArray.some((breadcrumbItem) => {
      return (
        breadcrumbItem.titulo === this._breadcrumbItemPaginaPrincipal.titulo &&
        breadcrumbItem.caminho === this._breadcrumbItemPaginaPrincipal.caminho
      );
    });
  }
}
