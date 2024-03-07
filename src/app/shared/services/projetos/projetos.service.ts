import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  IProject,
  IProjectCreate,
  IProjectEdit,
  IProjectGet,
} from '../../interfaces/project.interface';

@Injectable({
  providedIn: 'root',
})
export class ProjetosService {
  private _url = `${environment.apiUrl}/projetos`;

  constructor(private _http: HttpClient) {}

  getProjetoById(id: number): Observable<IProject> {
    return this._http.get<IProject>(`${this._url}/${id}`);
  }

  putProjeto(id: number, body: IProjectEdit): Observable<IProject> {
    return this._http.put<IProject>(`${this._url}/${id}`, body);
  }

  deleteProjeto(id: number): Observable<string> {
    return this._http.delete(`${this._url}/${id}`, { responseType: 'text' });
  }

  // TODO: Ver como anexar body no get (IHttpGetRequestBody)
  getProjetos(): Observable<IProjectGet> {
    return this._http.get<IProjectGet>(this._url);
  }

  postProjeto(body: IProjectCreate): Observable<IProject> {
    return this._http.post<IProject>(this._url, body);
  }
}
