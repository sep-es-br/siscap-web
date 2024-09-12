import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { OrganizacaoFormModel } from '../../models/organizacao.model';

import { IHttpBase } from '../../interfaces/http/http-base.interface';
import {
  IOrganizacao,
  IOrganizacaoTableData,
} from '../../interfaces/organizacao.interface';
import {
  IHttpGetRequestBody,
  IHttpGetResponseBody,
} from '../../interfaces/http/http-get.interface';

import { PageableQueryStringParametersHelper } from '../../helpers/pageable-query-string-parameters.helper';
import { FormDataHelper } from '../../helpers/form-data.helper';

import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrganizacoesService
  implements
    IHttpBase<IOrganizacao, IOrganizacaoTableData, OrganizacaoFormModel>
{
  private _url = `${environment.apiUrl}/organizacoes`;

  constructor(private _http: HttpClient) {}

  public getAllPaged(
    pageConfig: IHttpGetRequestBody
  ): Observable<IHttpGetResponseBody<IOrganizacaoTableData>> {
    return this._http.get<IHttpGetResponseBody<IOrganizacaoTableData>>(
      this._url,
      {
        params:
          PageableQueryStringParametersHelper.buildQueryStringParams(
            pageConfig
          ),
      }
    );
  }

  public getById(id: number): Observable<IOrganizacao> {
    return this._http.get<IOrganizacao>(`${this._url}/${id}`);
  }

  public post(
    body: OrganizacaoFormModel,
    imagemPerfil?: File
  ): Observable<IOrganizacao> {
    return this._http.post<IOrganizacao>(
      this._url,
      this.construirFormData(body, imagemPerfil)
    );
  }

  public put(
    id: number,
    body: OrganizacaoFormModel,
    imagemPerfil?: File
  ): Observable<IOrganizacao> {
    return this._http.put<IOrganizacao>(
      `${this._url}/${id}`,
      this.construirFormData(body, imagemPerfil)
    );
  }

  public delete(id: number): Observable<string> {
    return this._http.delete(`${this._url}/${id}`, { responseType: 'text' });
  }

  private construirFormData(
    body: OrganizacaoFormModel,
    imagemPerfil?: File
  ): FormData {
    const formData = FormDataHelper.appendFormGrouptoFormData(body);

    if (imagemPerfil) {
      formData.append('imagemPerfil', imagemPerfil);
    }

    return formData;
  }
}
