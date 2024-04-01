import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileService } from '../../shared/services/profile/profile.service';
import { finalize, first, tap } from 'rxjs';

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

    const previousUrl = sessionStorage.getItem('currentUrl') ?? 'main';

    this._profileService
      .getUserInfo()
      .pipe(
        first(),
        tap((response) => {
          sessionStorage.setItem('scp-profile', JSON.stringify(response));
        }),
        finalize(() => {
          this._router.navigate([previousUrl]);
          sessionStorage.removeItem('currentUrl');
        })
      )
      .subscribe();
  }
}
