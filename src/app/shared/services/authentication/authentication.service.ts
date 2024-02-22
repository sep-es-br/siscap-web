import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private _url = `${environment.api}/oauth2/authorization/acessocidadao`;

  constructor(private _http: HttpClient, private router: Router) {}

  public mockSignIn() {
    this.router.navigateByUrl('/main/home');
  }

  public acessoCidadaoSignIn() {
    document.location.href = this._url;
  }

  // public signIn() {
  //   window.location.href = this.getUrlForAuth();
  // }

  // private getUrlForAuth() {
  //   return `${
  //     this.api
  //   }/oauth2/authorization/idsvr?front_callback_url=${this.getFrontFallbackUrl()}`;
  // }

  // private getFrontFallbackUrl() {
  //   const { protocol, host } = window.location;
  //   // console.log(`${protocol}//${host}`);
  //   return `${protocol}//${host}`;
  // }
}
