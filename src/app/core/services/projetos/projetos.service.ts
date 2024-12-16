import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';

import { BehaviorSubject, Observable } from 'rxjs';

import { ProjetoFormModel } from '../../models/projeto.model';
import { RateioModel } from '../../models/rateio.model';
import { ValorModel } from '../../models/valor.model';

import {
  IHttpGetRequestBody,
  IHttpGetResponseBody,
} from '../../interfaces/http/http-get.interface';
import {
  IProjeto,
  IProjetoTableData,
} from '../../interfaces/projeto.interface';

import { TipoValorEnum } from '../../enums/tipo-valor.enum';

import { PageableQueryStringParametersHelper } from '../../helpers/pageable-query-string-parameters.helper';

import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProjetosService {
  private _url = `${environment.apiUrl}/projetos`;

  private _idProjeto$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  public get idProjeto$(): BehaviorSubject<number> {
    return this._idProjeto$;
  }

  constructor(private _http: HttpClient) {}

  public getAllPaged(
    pageConfig: IHttpGetRequestBody,
    ...searchFilter: { [key: string]: any }[]
  ): Observable<IHttpGetResponseBody<IProjetoTableData>> {
    return this._http.get<IHttpGetResponseBody<IProjetoTableData>>(this._url, {
      params: PageableQueryStringParametersHelper.buildQueryStringParams(
        pageConfig,
        ...searchFilter
      ),
    });
  }

  public getById(id: number): Observable<IProjeto> {
    return this._http.get<IProjeto>(`${this._url}/${id}`);
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

  public delete(id: number): Observable<string> {
    return this._http.delete(`${this._url}/${id}`, { responseType: 'text' });
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
}
