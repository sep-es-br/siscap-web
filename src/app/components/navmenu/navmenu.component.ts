import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'siscap-navmenu',
  standalone: false,
  templateUrl: './navmenu.component.html',
  styleUrl: './navmenu.component.scss',
})
export class NavMenuComponent {
  constructor(private _router: Router, private _route: ActivatedRoute) {}

  routerNavigation(route: string) {
    this._router.navigate([`${route}`], { relativeTo: this._route });
    this.hideMenu();
  }

  /**
   * Método para ocultar o menu quando o usuário estiver em um viewport de dispositivos mobile (max-width < 576px)
   *
   */
  hideMenu() {
    const navMenuEl = document.getElementById('nav-menu')!.classList;
    const responsiveContentEl =
      document.getElementById('responsive-content')!.classList;
    navMenuEl.add('d-none');
    responsiveContentEl.remove('d-none');
  }
}
