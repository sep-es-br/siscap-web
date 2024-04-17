import { Component, Input, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';

import { tap } from 'rxjs';

import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';

import { PessoasService } from '../../../shared/services/pessoas/pessoas.service';

import { IProfile } from '../../../shared/interfaces/profile.interface';
import { IPerson } from '../../../shared/interfaces/person.interface';

@Component({
  selector: 'siscap-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  @Input('offcanvasRef') navmenuOffcanvas!: TemplateRef<any>;

  private userId!: number;

  public userProfile!: IProfile;

  constructor(
    private _router: Router,
    private _pessoasService: PessoasService,
    private _offcanvasService: NgbOffcanvas
  ) {
    if (!!sessionStorage.getItem('user-profile')) {
      this.userProfile = JSON.parse(sessionStorage.getItem('user-profile')!);
    }

    this._pessoasService
      .getPessoaByEmail(this.userProfile.email)
      .pipe(
        tap((response: IPerson) => {
          this.userId = response.id;
        })
      )
      .subscribe();
  }

  showOffcanvas() {
    this._offcanvasService.open(this.navmenuOffcanvas);
  }

  convertByteArraytoImg(data: ArrayBuffer): string {
    return 'data:image/jpeg;base64,' + data;
  }

  redirectUserProfile() {
    this._router.navigate(['main', 'pessoas', 'form', 'editar'], {
      queryParams: { id: this.userId },
    });
  }

  logOut() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user-profile');
    localStorage.removeItem('currentUrl');
    this._router.navigate(['login']);
  }
}
