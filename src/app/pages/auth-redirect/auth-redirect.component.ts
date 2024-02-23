import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth-redirect',
  standalone: false,
  templateUrl: './auth-redirect.component.html',
  styleUrl: './auth-redirect.component.css',
})
export class AuthRedirectComponent {
  constructor(private _router: Router) {
    const tokenQueryParamMap =
      this._router.getCurrentNavigation()?.initialUrl.queryParamMap;

    if (tokenQueryParamMap?.has('token')) {
      localStorage.setItem(
        'token',
        atob(tokenQueryParamMap.get('token') as string)
      );
    }

    this._router.navigate(['main'])
  }
}
