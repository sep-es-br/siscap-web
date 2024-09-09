import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import {
  IOrganization,
  IOrganizationTableData,
} from '../../interfaces/organization.interface';
import {
  IHttpGetRequestBody,
  IHttpGetResponseBody,
} from '../../interfaces/http/http-get.interface';

import { environment } from '../../../../environments/environment';
import { PageableQueryStringParametersHelper } from '../../helpers/pageable-query-string-parameters.helper';
import { IHttpBase } from '../../interfaces/http/http-base.interface';
import {
  IOrganizacao,
  IOrganizacaoTableData,
} from '../../interfaces/organizacao.interface';
import { OrganizacaoFormModel } from '../../models/organizacao.model';
import { FormDataHelper } from '../../helpers/form-data.helper';

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

  public getOrganizacaoById(id: number): Observable<IOrganization> {
    return this._http.get<IOrganization>(`${this._url}/${id}`);
  }

  public getOrganizacoesPaginated(
    pageConfig: IHttpGetRequestBody
  ): Observable<IHttpGetResponseBody<IOrganizationTableData>> {
    return this._http.get<IHttpGetResponseBody<IOrganizationTableData>>(
      this._url,
      {
        params:
          PageableQueryStringParametersHelper.buildQueryStringParams(
            pageConfig
          ),
      }
    );
  }

  public putOrganizacao(id: number, body: FormData): Observable<IOrganization> {
    return this._http.put<IOrganization>(`${this._url}/${id}`, body);
  }

  public deleteOrganizacao(id: number): Observable<string> {
    return this._http.delete(`${this._url}/${id}`, { responseType: 'text' });
  }

  public postOrganizacao(body: FormData): Observable<IOrganization> {
    return this._http.post<IOrganization>(this._url, body);
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
