import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, Observable } from 'rxjs';

import { PessoaFormModel } from '../../models/pessoa.model';

import { IHttpBase } from '../../interfaces/http/http-base.interface';
import {
  IHttpGetRequestBody,
  IHttpGetResponseBody,
} from '../../interfaces/http/http-get.interface';
import {
  IPessoa,
  IPessoaAcessoCidadao,
  IPessoaTableData,
} from '../../interfaces/pessoa.interface';
import { IOpcoesDropdown } from '../../interfaces/opcoes-dropdown.interface';

import { PageableQueryStringParametersHelper } from '../../helpers/pageable-query-string-parameters.helper';
import { FormDataHelper } from '../../helpers/form-data.helper';

import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PessoasService
  implements IHttpBase<IPessoa, IPessoaTableData, PessoaFormModel>
{
  private _url = `${environment.apiUrl}/pessoas`;

  private _idPessoa$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  private _subNovoPessoa$: BehaviorSubject<string> =
    new BehaviorSubject<string>('');

  public get idPessoa$(): BehaviorSubject<number> {
    return this._idPessoa$;
  }

  public get subNovoPessoa$(): BehaviorSubject<string> {
    return this._subNovoPessoa$;
  }

  constructor(private _http: HttpClient) {}

  public getAllPaged(
    pageConfig: IHttpGetRequestBody
  ): Observable<IHttpGetResponseBody<IPessoaTableData>> {
    return this._http.get<IHttpGetResponseBody<IPessoaTableData>>(this._url, {
      params:
        PageableQueryStringParametersHelper.buildQueryStringParams(pageConfig),
    });
  }

  public getById(id: number): Observable<IPessoa> {
    return this._http.get<IPessoa>(`${this._url}/${id}`);
  }

  public post(body: PessoaFormModel, imagemPerfil?: File): Observable<IPessoa> {
    return this._http.post<IPessoa>(
      this._url,
      this.construirFormData(body, imagemPerfil)
    );
  }

  public put(
    id: number,
    body: PessoaFormModel,
    imagemPerfil?: File
  ): Observable<IPessoa> {
    return this._http.put<IPessoa>(
      `${this._url}/${id}`,
      this.construirFormData(body, imagemPerfil)
    );
  }

  public delete(id: number): Observable<string> {
    return this._http.delete(`${this._url}/${id}`, { responseType: 'text' });
  }

  public buscarPessoaNoAcessoCidadaoPorCpf(
    cpf: string
  ): Observable<IPessoaAcessoCidadao> {
    return this._http.get<IPessoaAcessoCidadao>(
      `${this._url}/acesso-cidadao/${cpf}`
    );
  }

  public buscarResponsavelPorIdOrganizacao(
    idOrganizacao: number
  ): Observable<IOpcoesDropdown> {
    return this._http.get<IOpcoesDropdown>(
      `${this._url}/responsavel/${idOrganizacao}`
    );
  }

  public buscarMeuPerfil(subNovo: string): Observable<IPessoa> {
    const params = {
      subNovo: subNovo,
    };

    return this._http.get<IPessoa>(`${this._url}/meu-perfil`, {
      params: params,
    });
  }

  public atualizarMeuPerfil(
    id: number,
    body: PessoaFormModel,
    imagemPerfil?: File
  ): Observable<IPessoa> {
    return this._http.put<IPessoa>(
      `${this._url}/meu-perfil/${id}`,
      this.construirFormData(body, imagemPerfil)
    );
  }

  private construirFormData(
    body: PessoaFormModel,
    imagemPerfil?: File
  ): FormData {
    const formData = FormDataHelper.appendFormGrouptoFormData(body, 'endereco');

    if (imagemPerfil) {
      formData.append('imagemPerfil', imagemPerfil);
    }

    return formData;
  }
}
