import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, Observable } from 'rxjs';

import { BaseHttpService } from '../http/base-http.service';

import { CartaConsultaFormModel } from '../../models/carta-consulta.model';
import { BotaoPropriedadesModel } from '../../../shared/components/botao/botao.model';

import { BotoesConfig } from '../../../shared/components/botao/botao.config';

import {
  ICartaConsulta,
  ICartaConsultaDetalhes,
  ICartaConsultaTableData,
} from '../../interfaces/carta-consulta.interface';
import { Post } from '../../interfaces/http-post.interface';
import { Put } from '../../interfaces/http-put.interface';

import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CartasConsultaService
  extends BaseHttpService<ICartaConsulta, ICartaConsultaTableData>
  implements
    Post<ICartaConsulta, CartaConsultaFormModel>,
    Put<ICartaConsulta, CartaConsultaFormModel>
{
  private readonly _url = `${environment.apiUrl}/cartas-consulta`;

  private readonly _idCartaConsulta$: BehaviorSubject<number> =
    new BehaviorSubject<number>(0);

  public get idCartaConsulta$(): BehaviorSubject<number> {
    return this._idCartaConsulta$;
  }

  private readonly _idCartaConsultaDetalhes$: BehaviorSubject<number> =
    new BehaviorSubject<number>(0);

  public get idCartaConsultaDetalhes$(): BehaviorSubject<number> {
    return this._idCartaConsultaDetalhes$;
  }

  constructor(private readonly _http: HttpClient) {
    super(_http, 'cartas-consulta');
  }

  public gerarBotoesAcaoListagem(): Array<BotaoPropriedadesModel> {
    const botaoCriar = BotoesConfig.gerarBotaoPropriedades('criar', {
      texto: 'Nova Pesquisa Fonte Financiamento',
    });

    return [botaoCriar];
  }

  public gerarBotoesAcaoVisualizarDetalhes(): Array<BotaoPropriedadesModel> {
    const botaoEditar = BotoesConfig.gerarBotaoPropriedades('editar');
    const botaoVoltar = BotoesConfig.gerarBotaoPropriedades('voltar', {
      acao: 'cancelar',
    });

    return [botaoEditar, botaoVoltar];
  }

  public gerarBotoesAcaoVisualizarDetalhesProspeccaoRealizada(): Array<BotaoPropriedadesModel> {
    const botaoVoltar = BotoesConfig.gerarBotaoPropriedades('voltar', {
      acao: 'cancelar',
    });

    return [botaoVoltar];
  }

  public gerarBotoesAcaoFormulario(): Array<BotaoPropriedadesModel> {
    const botaoSalvar = BotoesConfig.gerarBotaoPropriedades('salvar');
    const botaoCancelar = BotoesConfig.gerarBotaoPropriedades('cancelar');

    return [botaoSalvar, botaoCancelar];
  }

  public post(body: CartaConsultaFormModel): Observable<ICartaConsulta> {
    return this._http.post<ICartaConsulta>(this._url, body);
  }

  public put(
    id: number,
    body: CartaConsultaFormModel
  ): Observable<ICartaConsulta> {
    return this._http.put<ICartaConsulta>(`${this._url}/${id}`, body);
  }

  public buscarDetalhesCartaConsulta(
    id: number
  ): Observable<ICartaConsultaDetalhes> {
    return this._http.get<ICartaConsultaDetalhes>(
      `${this._url}/${id}/detalhes`
    );
  }
}
