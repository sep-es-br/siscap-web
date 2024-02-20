import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  IProject,
  IProjectGet,
  ProjectCreate,
  ProjectEdit,
} from '../../interfaces/project.interface';

@Injectable({
  providedIn: 'root',
})

//TODO: criar os metodos de edição e deleção(?) de projetos
export class ProjetosService {
  private _url = `${environment.api}/projetos`;

  constructor(private _http: HttpClient) {}

  getProjetos(): Observable<IProjectGet> {
    return this._http.get<IProjectGet>(this._url);
  }

  getProjetosById(id: number): Observable<IProject> {
    return this._http.get<IProject>(`${this._url}/${id}`);
  }

  postProjetos(body: ProjectCreate): Observable<IProject> {
    return this._http.post<IProject>(this._url, body);
  }

  putProjeto(id: number, body: ProjectEdit): Observable<IProject> {
    return this._http.put<IProject>(`${this._url}/${id}`, body);
  }
}
