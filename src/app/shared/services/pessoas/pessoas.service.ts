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
  // private _url = `${environment.apiUrl}/pessoasaa`;

  constructor(private _http: HttpClient) {}

  getPessoaById(id: number): Observable<IPerson> {
    return this._http.get<IPerson>(`${this._url}/${id}`);
  }

  putPessoa(id: number, body: IPersonEdit): Observable<IPerson> {
    return this._http.put<IPerson>(`${this._url}/${id}`, body);
  }

  deletePessoa(id: number): Observable<string> {
    return this._http.delete(`${this._url}/${id}`, { responseType: 'text' });
  }

  // TODO: Ver como anexar body no get (IHttpGetRequestBody)
  getPessoas(): Observable<IPersonGet> {
    return this._http.get<IPersonGet>(this._url);
  }

  // Formato de envio não é JSON -> headers: Content-Type: multipart/formdata
  postPessoa(body: FormData): Observable<IPerson> {
    return this._http.post<IPerson>(this._url, body);
  }

  // getPessoaImagemPerfil(id: number): Observable<Blob> {
  //   const headers = new HttpHeaders({
  //     Accept: 'image/*',
  //   });
  //   return this._http.get(`${this._url}/${id}/imagem-perfil`, {
  //     headers: headers,
  //     responseType: 'blob',
  //   });
  // }
}

/*

Ideia select pais/estado/cidade

getCidades(filtro: string, id:numnber){
  //codigo
}

this.getCidades('PAIS', 5) -> retorna cidades de acordo com o pais
this.getCidades('ESTADO', 9) -> retorna cidades de acord com o estado

*/