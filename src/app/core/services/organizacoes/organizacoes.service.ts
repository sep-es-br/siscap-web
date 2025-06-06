import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, Observable } from 'rxjs';

import { BaseHttpService } from '../http/base-http.service';

import { OrganizacaoFormModel } from '../../models/organizacao.model';
import { BotaoPropriedadesModel } from '../../../shared/components/botao/botao.model';

import { BotoesConfig } from '../../../shared/components/botao/botao.config';

import {
  IOrganizacao,
  IOrganizacaoTableData,
} from '../../interfaces/organizacao.interface';

import { FormDataHelper } from '../../helpers/form-data.helper';

import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrganizacoesService extends BaseHttpService<
  IOrganizacao,
  IOrganizacaoTableData
> {
  private readonly _url = `${environment.apiUrl}/organizacoes`;

  private readonly _idOrganizacao$: BehaviorSubject<number> =
    new BehaviorSubject<number>(0);

  public get idOrganizacao$(): BehaviorSubject<number> {
    return this._idOrganizacao$;
  }

  constructor(private readonly _http: HttpClient) {
    super(_http, 'organizacoes');
  }

  public gerarBotoesAcaoListagem(): Array<BotaoPropriedadesModel> {
    const botaoCriar = BotoesConfig.gerarBotaoPropriedades('criar', {
      texto: 'Nova Organização',
    });

    return [botaoCriar];
  }

  public gerarBotoesAcaoFormulario(): Array<BotaoPropriedadesModel> {
    const botaoSalvar = BotoesConfig.gerarBotaoPropriedades('salvar');
    const botaoCancelar = BotoesConfig.gerarBotaoPropriedades('cancelar');

    return [botaoSalvar, botaoCancelar];
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
