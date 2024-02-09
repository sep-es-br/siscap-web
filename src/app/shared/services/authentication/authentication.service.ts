import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private api = 'http://localhost:8080/siscap';

  constructor(private router: Router) {}

  public mockSignIn() {
    this.router.navigateByUrl('/home');
  }

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
