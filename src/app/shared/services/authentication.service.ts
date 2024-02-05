import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private api = 'http://localhost:8080/siscap';

  constructor() {}

  public signIn() {
    window.location.href = this.getUrlForAuth();
  }

  private getUrlForAuth() {
    return `${
      this.api
    }/oauth2/authorization/idsvr?front_callback_url=${this.getFrontFallbackUrl()}`;
  }

  private getFrontFallbackUrl() {
    const { protocol, host } = window.location;
    // console.log(`${protocol}//${host}`);
    return `${protocol}//${host}`;
  }
}
