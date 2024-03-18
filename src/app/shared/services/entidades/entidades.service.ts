import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  IEntity,
  IEntityCreate,
  IEntityEdit,
  IEntityGet,
} from '../../interfaces/entity.interface';

@Injectable({
  providedIn: 'root',
})
export class EntidadesService {
  private _url = `${environment.apiUrl}/entidades`;

  constructor(private _http: HttpClient) {}

  getEntidadeById(id: number): Observable<IEntity> {
    return this._http.get<IEntity>(`${this._url}/${id}`);
  }

  putEntidade(id: number, body: FormData): Observable<IEntity> {
    return this._http.put<IEntity>(`${this._url}/${id}`, body);
  }

  deleteEntidade(id: number): Observable<string> {
    return this._http.delete(`${this._url}/${id}`, { responseType: 'text' });
  }

  getEntidades(): Observable<IEntityGet> {
    return this._http.get<IEntityGet>(this._url);
  }

  postEntidade(body: FormData): Observable<IEntity> {
    return this._http.post<IEntity>(this._url, body);
  }
}
