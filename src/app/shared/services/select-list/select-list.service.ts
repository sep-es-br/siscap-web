import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable, catchError, throwError } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ISelectList } from '../../interfaces/select-list.interface';
import { ErrorHandlerService } from '../error-handler/error-handler.service';

@Injectable({
  providedIn: 'root',
})
export class SelectListService {
  private _url = `${environment.apiUrl}/destination/select`;

  constructor(
    private _http: HttpClient,
    private _errorHandlerService: ErrorHandlerService
  ) {}

  private getSelectList(
    destination: string,
    params?: any
  ): Observable<ISelectList[]> {
    return this._http
      .get<ISelectList[]>(this._url.replace('destination', destination), {
        params: params,
      })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this._errorHandlerService.handleError(err);
          return throwError(() => err);
        })
      );
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
}
