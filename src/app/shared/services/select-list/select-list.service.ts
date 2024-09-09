import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import {
  ICidadeSelectList,
  ISelectList,
} from '../../interfaces/select-list.interface';

import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SelectListService {
  private _url = `${environment.apiUrl}/destination/select`;

  constructor(private _http: HttpClient) {}

  private getSelectList(
    destination: string,
    params?: any,
    ...pathArgs: Array<string>
  ): Observable<ISelectList[]> {
    const urlReplaceDestination = this._url.replace('destination', destination);
    const urlAddOptionalPathArgs = urlReplaceDestination.concat(
      pathArgs.length > 0 ? `/${pathArgs.join('/')}` : ''
    );

    return this._http.get<ISelectList[]>(urlAddOptionalPathArgs, {
      params: params,
    });
  }

  public getPessoas() {
    return this.getSelectList('pessoas');
  }

  public getPlanos() {
    return this.getSelectList('planos');
  }

  public getOrganizacoes() {
    return this.getSelectList('organizacoes');
  }

  public getTiposOrganizacoes() {
    return this.getSelectList('tipos-organizacoes');
  }

  public getMicrorregioes() {
    return this.getSelectList('microrregioes');
  }

  public getPaises() {
    return this.getSelectList('paises');
  }

  public getEstados(idPais: number) {
    const params = {
      idPais: idPais,
    };
    return this.getSelectList('estados', params);
  }

  public getCidades(filtrarPor: string, id: number) {
    const params = {
      filtrarPor: filtrarPor,
      id: id,
    };
    return this.getSelectList('cidades', params);
  }

  public getAreasAtuacao() {
    return this.getSelectList('areas-atuacao');
  }

  public getPapeis() {
    return this.getSelectList('papeis');
  }

  public getProjetosSelectList() {
    return this.getSelectList('projetos');
  }

  public getValores() {
    return this.getSelectList('valor');
  }

  public getCidadesComMicrorregiao() {
    return this.getSelectList('cidades', null, 'microrregioes') as Observable<
      ICidadeSelectList[]
    >;
  }
}
