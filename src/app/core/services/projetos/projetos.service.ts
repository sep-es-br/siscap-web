import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';

import { BehaviorSubject, Observable } from 'rxjs';

import { BaseHttpService } from '../http/base-http.service';

import { ProjetoFormModel } from '../../models/projeto.model';
import { RateioModel } from '../../models/rateio.model';
import { ValorModel } from '../../models/valor.model';
import { BotaoPropriedadesModel } from '../../../shared/components/botao/botao.model';

import { BotoesConfig } from '../../../shared/components/botao/botao.config';

import {
  IProjeto,
  IProjetoTableData,
} from '../../interfaces/projeto.interface';

import { TipoValorEnum } from '../../enums/tipo-valor.enum';

import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProjetosService extends BaseHttpService<
  IProjeto,
  IProjetoTableData
> {
  private readonly _url = `${environment.apiUrl}/projetos`;

  private readonly _idProjeto$: BehaviorSubject<number> =
    new BehaviorSubject<number>(0);

  public get idProjeto$(): BehaviorSubject<number> {
    return this._idProjeto$;
  }

  constructor(private readonly _http: HttpClient) {
    super(_http, 'projetos');
  }

  public gerarBotoesAcaoListagem(): Array<BotaoPropriedadesModel> {
    const botaoCriar = BotoesConfig.gerarBotaoPropriedades('criar', {
      texto: 'Novo Projeto',
    });

    return [botaoCriar];
  }

  public gerarBotoesAcaoListagemProponente(): Array<BotaoPropriedadesModel> {
    const botaoCriar = BotoesConfig.gerarBotaoPropriedades('criar', {
      texto: 'Novo DIC',
    });

    return [botaoCriar];
  }

  public gerarBotoesAcaoFormulario(): Array<BotaoPropriedadesModel> {
    const botaoSalvar = BotoesConfig.gerarBotaoPropriedades('salvar');
    const botaoEnviar = BotoesConfig.gerarBotaoPropriedades('enviar');
    const botaoCancelar = BotoesConfig.gerarBotaoPropriedades('cancelar');

    return [botaoEnviar, botaoSalvar, botaoCancelar];
  }

  public gerarBotoesAcaoFormularioProponente(): Array<BotaoPropriedadesModel> {
    const botaoCancelar = BotoesConfig.gerarBotaoPropriedades('cancelar');

    return [botaoCancelar];
  }

  public construirProjetoModelRateio(
    idMicrorregioesList: Array<number>,
    valorEstimado: number
  ): Array<RateioModel> {
    const percentualPorLocalidade = 100 / idMicrorregioesList.length;
    const quantiaPorLocalidade = valorEstimado / idMicrorregioesList.length;

    return idMicrorregioesList.map((idLocalidade) => {
      return new RateioModel({
        idLocalidade,
        percentual: percentualPorLocalidade,
        quantia: quantiaPorLocalidade,
      });
    });
  }

  public construirValorControleIdMicrorregioesList(
    rateioModelArray?: Array<RateioModel>
  ): Array<number> | null {
    if (!rateioModelArray) return null;

    return rateioModelArray.map((rateio) => rateio.idLocalidade);
  }

  public construirProjetoModelValor(valorEstimado: number): ValorModel {
    const tipoValor = TipoValorEnum.Estimado;
    const moedaValor = 'BRL';

    return new ValorModel({
      tipo: tipoValor,
      moeda: moedaValor,
      quantia: valorEstimado,
    });
  }

  public construirValorControleValorEstimado(
    valorModel?: ValorModel
  ): number | null {
    if (!valorModel) return null;

    return valorModel.quantia;
  }

  public post(
    body: ProjetoFormModel,
    isRascunho: boolean
  ): Observable<IProjeto> {
    return this._http.post<IProjeto>(
      `${this._url}?rascunho=${isRascunho}`,
      body
    );
  }

  public put(
    id: number,
    body: ProjetoFormModel,
    isRascunho: boolean
  ): Observable<IProjeto> {
    return this._http.put<IProjeto>(
      `${this._url}/${id}?rascunho=${isRascunho}`,
      body
    );
  }

  public alterarStatusProjeto(id: number, status: string): Observable<string> {
    return this._http.put(
      `${this._url}/${id}/status`,
      { status },
      { responseType: 'text' }
    );
  }

  public baixarDIC(id: number): void {
    const userHttpOptions: Object = {
      responseType: 'arraybuffer',
      observe: 'response',
    };
    this._http
      .get<Blob>(`${this._url}/dic/${id}`, userHttpOptions)
      .subscribe((response) => {
        if (response instanceof HttpResponse) {
          const httpResponse = response as HttpResponse<Blob>;
          const contentDisposition = httpResponse.headers.get(
            'Content-Disposition'
          );
          if (httpResponse.body && contentDisposition) {
            const filename = contentDisposition
              .split('filename=')[1]
              .split(';')[0]
              .replace(/["']/g, '');
            const pdfBlob = new Blob([httpResponse.body], {
              type: 'application/pdf',
            });
            let url = window.URL.createObjectURL(pdfBlob);
            let a = document.createElement('a');
            document.body.appendChild(a);
            a.setAttribute('style', 'display: none');
            a.href = url;
            a.download = filename;
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
          }
        }
      });
  }
}
