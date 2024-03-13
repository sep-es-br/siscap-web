import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ISelectList } from '../../interfaces/select-list.interface';

@Injectable({
  providedIn: 'root',
})
export class SelectListService {
  private _url = `${environment.apiUrl}/destination/select`;

  constructor(private _http: HttpClient) {}

  private getSelectList(
    destination: string,
    params?: any
  ): Observable<ISelectList[]> {
    return this._http.get<ISelectList[]>(
      this._url.replace('destination', destination),
      { params: params }
    );
  }

  public getPessoas() {
    return this.getSelectList('pessoas');
  }

  public getPlanos() {
    return this.getSelectList('planos');
  }

  public getEntidades() {
    return this.getSelectList('entidades');
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
}
