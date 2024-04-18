import { Component, Input, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';

import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';

import { IProfile } from '../../../shared/interfaces/profile.interface';

@Component({
  selector: 'siscap-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  @Input('offcanvasRef') navmenuOffcanvas!: TemplateRef<any>;

  public userProfile!: IProfile;

  constructor(
    private _router: Router,
    private _offcanvasService: NgbOffcanvas
  ) {
    if (!!sessionStorage.getItem('user-profile')) {
      this.userProfile = JSON.parse(sessionStorage.getItem('user-profile')!);
    }
  }

  showOffcanvas() {
    this._offcanvasService.open(this.navmenuOffcanvas);
  }

  convertByteArraytoImg(data: ArrayBuffer): string {
    return 'data:image/jpeg;base64,' + data;
  }

  redirectUserProfile() {
    this._router.navigate(['main', 'pessoas', 'form', 'editar'], {
      queryParams: { email: this.userProfile.email },
    });
  }

  logOut() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user-profile');
    this._router.navigate(['login']);
  }
}
