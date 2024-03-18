import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileService } from '../../shared/services/profile/profile.service';

@Component({
  selector: 'app-auth-redirect',
  standalone: false,
  templateUrl: './auth-redirect.component.html',
  styleUrl: './auth-redirect.component.css',
})
export class AuthRedirectComponent {
  constructor(
    private _router: Router,
    private _profileService: ProfileService) {
    
    const tokenQueryParamMap =
      this._router.getCurrentNavigation()?.initialUrl.queryParamMap;

    if (tokenQueryParamMap?.has('token')) {
      sessionStorage.setItem(
        'token',
        atob(tokenQueryParamMap.get('token') as string)
      );
    }

    this._profileService.getUserInfo().subscribe(profile => {
      sessionStorage.setItem('scp-profile', JSON.stringify(profile));
    });

    this._router.navigate(['main'])
  }
}
