import { Injectable } from '@angular/core';

import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private _url = `${environment.apiUrl}/oauth2/authorization/acessocidadao`;
  private _signOutUrl = 'https://acessocidadao.es.gov.br/is/connect/endsession';

  constructor() {}

  public acessoCidadaoSignIn() {
    window.location.href = this._url;
  }

  public acessoCidadaoSignOut() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario-perfil');
    window.location.href = this._signOutUrl;
  }
}
