import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IProfile } from '../../shared/interfaces/profile.interface';

@Component({
  selector: 'siscap-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  public userProfile!: IProfile;

  constructor(private _router: Router) {
    if (!!sessionStorage.getItem('scp-profile')) {
      this.userProfile = JSON.parse(sessionStorage.getItem('scp-profile')!);
    }
  }

  convertByteArraytoImg(data: ArrayBuffer): string {
    return 'data:image/jpeg;base64,' + data;
  }

  logOut() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('scp-profile');
    this._router.navigate(['login']);
  }
}