import { Component, Input, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';

import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { NavMenuLinks, IMenuLink } from '../../../shared/utils/navmenu-links';
import { IProfile } from '../../../shared/interfaces/profile.interface';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'siscap-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  @Input('offcanvasRef') navmenuOffcanvas!: TemplateRef<any>;
  public userProfile!: IProfile;
  public imageUser: string = 'https://gravatar.com/avatar/00000000000000000000000000000000';
  public UserName!: string;
  public UserEmail!: string;
  public currentUrl!: string | undefined;
  protected menuLinks = NavMenuLinks.menuLinks;
  public currentCategory: IMenuLink = {
    category: '',
    hidden: false,
    slug: '',
    routes: [],
  }

  constructor(
    private _router: Router,
    private _offcanvasService: NgbOffcanvas,
    private activatedRoute: ActivatedRoute
  ) {
    if (!!sessionStorage.getItem('user-profile')) {
      this.userProfile = JSON.parse(sessionStorage.getItem('user-profile')!);
      this.UserName = this.userProfile.nome.split(' ')[0] + ' ' + this.userProfile.nome.split(' ').slice(-1)[0];
      this.UserEmail = this.userProfile.email;
      if (this.userProfile.imagemPerfil !== undefined && this.userProfile.imagemPerfil !== null) {
        this.imageUser = this.convertByteArraytoImg(this.userProfile.imagemPerfil);
      }
    }
  }

  ngDoCheck(): void {
    //Called every time that the input properties of a component or a directive are checked. Use it to extend change detection by performing a custom check.
    //Add 'implements DoCheck' to the class.
    this.currentUrl = this.activatedRoute.snapshot.children[0].routeConfig?.path?.split('/')[0];
    this.activedCategory();
  }

  showOffcanvas() {
    this._offcanvasService.open(this.navmenuOffcanvas);
  }

  convertByteArraytoImg(data: ArrayBuffer): string {
    return 'data:image/jpeg;base64,' + data;
  }

  activedCategory() {
    console.log(" Current URL | ",this.currentUrl);
    this.menuLinks.forEach((category) => {
      category.routes.forEach((route) => {
        if (route.path === this.currentUrl) {
          this.currentCategory = category;
        }
      });
    });
  }

  logOut() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user-profile');
    localStorage.removeItem('currentUrl');
    this._router.navigate(['login']);
  }
}
