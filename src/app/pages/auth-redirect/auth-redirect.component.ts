import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { finalize, tap } from 'rxjs';

import { ProfileService } from '../../shared/services/profile/profile.service';

import { IProfile } from '../../shared/interfaces/profile.interface';

@Component({
  selector: 'siscap-auth-redirect',
  standalone: false,
  templateUrl: './auth-redirect.component.html',
  styleUrl: './auth-redirect.component.scss',
})
export class AuthRedirectComponent {
  constructor(
    private _router: Router,
    private _profileService: ProfileService
  ) {
    const tokenQueryParamMap =
      this._router.getCurrentNavigation()?.initialUrl.queryParamMap;

    if (tokenQueryParamMap?.has('token')) {
      sessionStorage.setItem(
        'token',
        atob(tokenQueryParamMap.get('token') as string)
      );
    }

    this._profileService
      .getUserInfo()
      .pipe(
        tap((response: IProfile) => {
          const siscapToken = response.token;

          sessionStorage.setItem('token', siscapToken);
        }),
        tap((response: IProfile) => {
          const userProfile = {
            nome: response.nome,
            email: response.email,
            imagemPerfil: response.imagemPerfil,
            permissoes: response.permissoes,
          };

          sessionStorage.setItem('user-profile', JSON.stringify(userProfile));
        }),
        finalize(() => {
          this._router.navigate(['main']);
        })
      )
      .subscribe();
  }
}
