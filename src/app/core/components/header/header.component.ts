import {Component, Input, TemplateRef} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {IMenuLink, NavMenuLinks} from '../../../shared/utils/navmenu-links';
import {IProfile} from '../../../shared/interfaces/profile.interface';

@Component({
  selector: 'siscap-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  @Input('offcanvasRef') navmenuOffcanvas!: TemplateRef<any>;

  public userProfile!: IProfile;
  public imageUser: string = '/assets/images/user.png';
  public UserName!: string;
  public UserEmail!: string;
  public currentUrl!: string | undefined;
  protected menuLinks = NavMenuLinks.menuLinks;
  showMenu = false;
  public currentCategory: IMenuLink = {
    category: '',
    hidden: false,
    slug: '',
    routes: [],
  }

  constructor(
    private _router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    if (sessionStorage.getItem('user-profile')) {
      this.fillProfile();
    }
  }

  ngDoCheck(): void {
    this.currentUrl = this.activatedRoute.snapshot.children[0].routeConfig?.path?.split('/')[0];
    this.activedCategory();
  }

  convertByteArraytoImg(data: ArrayBuffer): string {
    return 'data:image/jpeg;base64,' + data;
  }

  activedCategory() {
    this.menuLinks.forEach((category) => {
      category.routes.forEach((route) => {
        if (route.path === this.currentUrl) {
          this.currentCategory = category;
        }
      });
    });
  }

  redirectUserProfile() {
    this._router.navigate(['main', 'pessoas', 'form', 'editar'], {
      skipLocationChange: true,
      queryParams: { subNovo: this.userProfile.subNovo },
    });
  }

  logOut() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user-profile');
    window.location.href = "https://acessocidadao.es.gov.br/is/connect/endsession";
  }

  navigateFirstLink(item: IMenuLink) {
    this._router.navigate(['main/'+item.routes[0].path]);
  }

  private fillProfile() {
    this.userProfile = JSON.parse(sessionStorage.getItem('user-profile')!);
    this.UserName = this.userProfile.nome.split(' ')[0] + ' ' + this.userProfile.nome.split(' ').slice(-1)[0];
    this.UserEmail = this.userProfile.email;
    if (this.userProfile.imagemPerfil !== undefined && this.userProfile.imagemPerfil !== null) {
      this.imageUser = this.convertByteArraytoImg(this.userProfile.imagemPerfil);
    }
  }

}
