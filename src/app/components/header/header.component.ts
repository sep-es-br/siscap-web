import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IProfile } from '../../shared/interfaces/profile.interface';

@Component({
  selector: 'app-header',
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

  showMenu() {
    const navMenuEl = document.getElementById('nav-menu')!.classList;
    const responsiveContentEl =
      document.getElementById('responsive-content')!.classList;

    navMenuEl.remove('d-none');
    responsiveContentEl.add('d-none');
  }

  logOut() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('scp-profile');
    this._router.navigate(['login']);
  }
}
