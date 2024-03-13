import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  IPerson,
  IPersonCreate,
  IPersonEdit,
  IPersonGet,
} from '../../interfaces/person.interface';

@Injectable({
  providedIn: 'root',
})
export class PessoasService {
  private _url = `${environment.apiUrl}/pessoas`;

  constructor(private _http: HttpClient) {}

  getPessoaById(id: number): Observable<IPerson> {
    return this._http.get<IPerson>(`${this._url}/${id}`);
  }

  putPessoa(id: number, body: FormData): Observable<IPerson> {
    return this._http.put<IPerson>(`${this._url}/${id}`, body);
  }

  deletePessoa(id: number): Observable<string> {
    return this._http.delete(`${this._url}/${id}`, { responseType: 'text' });
  }

  // TODO: Ver como anexar body no get (IHttpGetRequestBody)
  getPessoas(): Observable<IPersonGet> {
    return this._http.get<IPersonGet>(this._url);
  }

  postPessoa(body: FormData): Observable<IPerson> {
    return this._http.post<IPerson>(this._url, body);
  }
}
