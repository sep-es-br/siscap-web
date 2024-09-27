import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';

import { BehaviorSubject, Observable } from 'rxjs';

import { ProjetoFormModel } from '../../models/projeto.model';

import { IHttpBase } from '../../interfaces/http/http-base.interface';
import {
  IHttpGetRequestBody,
  IHttpGetResponseBody,
} from '../../interfaces/http/http-get.interface';
import {
  IProjeto,
  IProjetoTableData,
} from '../../interfaces/projeto.interface';

import { PageableQueryStringParametersHelper } from '../../helpers/pageable-query-string-parameters.helper';

import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProjetosService
  implements IHttpBase<IProjeto, IProjetoTableData, ProjetoFormModel>
{
  private _url = `${environment.apiUrl}/projetos`;

  private _idProjeto$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  public get idProjeto$(): BehaviorSubject<number> {
    return this._idProjeto$;
  }

  constructor(private _http: HttpClient) {}

  public getAllPaged(
    pageConfig: IHttpGetRequestBody
  ): Observable<IHttpGetResponseBody<IProjetoTableData>> {
    return this._http.get<IHttpGetResponseBody<IProjetoTableData>>(this._url, {
      params:
        PageableQueryStringParametersHelper.buildQueryStringParams(pageConfig),
    });
  }

  public getById(id: number): Observable<IProjeto> {
    return this._http.get<IProjeto>(`${this._url}/${id}`);
  }

  public post(body: ProjetoFormModel): Observable<IProjeto> {
    return this._http.post<IProjeto>(this._url, body);
  }

  public put(id: number, body: ProjetoFormModel): Observable<IProjeto> {
    return this._http.put<IProjeto>(`${this._url}/${id}`, body);
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
}
