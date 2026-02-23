import { Injectable } from '@angular/core';

import { environment } from '../../../../environments/environment';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private _url = `${environment.apiUrl}/oauth2/authorization/acessocidadao`;
  private _signOutUrl = 'https://acessocidadao.es.gov.br/is/connect/endsession';

  constructor(private router: Router) {}

  public acessoCidadaoSignIn() {
    const currentUrl = this.router.url;
    // if (currentUrl.startsWith('/projetos/editar/')) {
    //   sessionStorage.setItem('externalRedirectUrl', currentUrl);
    // }
    
    // sessionStorage.setItem('externalRedirectUrl', currentUrl);
    window.location.href = this._url;
  }

  public acessoCidadaoSignOut() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario-perfil');
    window.location.href = this._signOutUrl;
  }
}