import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private _url = `${environment.api}/signin`;

  // private headers = {
  //   headers: { 'Access-Control-Allow-Origin': 'http://localhost:8080' },
  // };

  constructor(private _http: HttpClient, private router: Router) {}

  public mockSignIn() {
    this.router.navigateByUrl('/main/home');
  }

  public acessoCidadaoSignIn(): Observable<any> {
    // return this._http.get(this._url, this.headers);
    return this._http.get(this._url);
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
