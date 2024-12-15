import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TesteUsuarioRolesService {
  private _url = `${environment.apiUrl}/test-user-roles`;

  constructor(private _http: HttpClient) {}

  public buscarSubAgentePublicoPorCpf(cpf: string): Observable<any> {
    return this._http.get<any>(`${this._url}/sub/${cpf}`);
  }

  public listarPapeisAgentePublicoPorSub(sub: string): Observable<any> {
    return this._http.get<any>(`${this._url}/papeis/${sub}`);
  }

  public buscarUnidadeInfoPorLotacaoGuid(lotacaoGuid: string): Observable<any> {
    return this._http.get<any>(`${this._url}/unidade-info/${lotacaoGuid}`);
  }

  public buscarDadosOrganizacaoPorGuid(guid: string): Observable<any> {
	return this._http.get<any>(`${this._url}/organizacao/${guid}`);
  }
}
