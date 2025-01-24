import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, Observable } from 'rxjs';

import { BaseHttpService } from '../http/base-http.service';

import { ProspeccaoFormModel } from '../../models/prospeccao.model';
import { BotaoPropriedadesModel } from '../../../shared/components/botao/botao.model';

import { BotoesConfig } from '../../../shared/components/botao/botao.config';

import {
  IProspeccao,
  IProspeccaoDetalhes,
  IProspeccaoTableData,
} from '../../interfaces/prospeccao.interface';
import { Post } from '../../interfaces/http-post.interface';
import { Put } from '../../interfaces/http-put.interface';

import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProspeccoesService
  extends BaseHttpService<IProspeccao, IProspeccaoTableData>
  implements
    Post<IProspeccao, ProspeccaoFormModel>,
    Put<IProspeccao, ProspeccaoFormModel>
{
  private readonly _url = `${environment.apiUrl}/prospeccoes`;

  private readonly _idProspeccao$: BehaviorSubject<number> =
    new BehaviorSubject<number>(0);

  public get idProspeccao$(): BehaviorSubject<number> {
    return this._idProspeccao$;
  }

  private readonly _idProspeccaoDetalhes$: BehaviorSubject<number> =
    new BehaviorSubject<number>(0);

  public get idProspeccaoDetalhes$(): BehaviorSubject<number> {
    return this._idProspeccaoDetalhes$;
  }

  constructor(private readonly _http: HttpClient) {
    super(_http, 'prospeccoes');
  }

  public gerarBotoesAcaoListagem(): Array<BotaoPropriedadesModel> {
    const botaoCriar = BotoesConfig.gerarBotaoPropriedades('criar', {
      texto: 'Nova Prospecção',
    });

    return [botaoCriar];
  }

  public gerarBotoesAcaoVisualizarDetalhes(): Array<BotaoPropriedadesModel> {
    const botaoProspectar = BotoesConfig.gerarBotaoPropriedades('prospectar');
    const botaoEditar = BotoesConfig.gerarBotaoPropriedades('editar');
    const botaoVoltar = BotoesConfig.gerarBotaoPropriedades('voltar', {
      acao: 'cancelar',
    });

    return [botaoProspectar, botaoEditar, botaoVoltar];
  }

  public gerarBotoesAcaoVisualizarDetalhesProspeccaoRealizada(): Array<BotaoPropriedadesModel> {
    const botaoProspectar = BotoesConfig.gerarBotaoPropriedades('prospectar', {
      desabilitado: true,
    });
    const botaoVoltar = BotoesConfig.gerarBotaoPropriedades('voltar', {
      acao: 'cancelar',
    });

    return [botaoProspectar, botaoVoltar];
  }

  public gerarBotoesAcaoFormulario(): Array<BotaoPropriedadesModel> {
    const botaoSalvar = BotoesConfig.gerarBotaoPropriedades('salvar');
    const botaoCancelar = BotoesConfig.gerarBotaoPropriedades('cancelar');

    return [botaoSalvar, botaoCancelar];
  }

  public post(body: ProspeccaoFormModel): Observable<IProspeccao> {
    return this._http.post<IProspeccao>(this._url, body);
  }

  public put(id: number, body: ProspeccaoFormModel): Observable<IProspeccao> {
    return this._http.put<IProspeccao>(`${this._url}/${id}`, body);
  }

  public buscarDetalhesProspeccao(id: number): Observable<IProspeccaoDetalhes> {
    return this._http.get<IProspeccaoDetalhes>(`${this._url}/${id}/detalhes`);
  }

  public enviarEmailProspeccao(id: number): Observable<string> {
    return this._http.post(`${this._url}/${id}/prospectar`, null, {
      responseType: 'text',
    });
  }
}
