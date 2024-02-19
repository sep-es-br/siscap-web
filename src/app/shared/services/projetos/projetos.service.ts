import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
//TODO: tipar os argumentos e retorno dos métodos
//TODO: criar os metodos de edição e deleção(?) de projetos
export class ProjetosService {
  private _url = `${environment.api}/projetos`;

  constructor(private _http: HttpClient) {}

  getProjetos(): Observable<any> {
    return this._http.get(this._url);
  }

  postProjetos(body: any) {
    return this._http.post(this._url, body, { observe: 'response' });
  }
}
