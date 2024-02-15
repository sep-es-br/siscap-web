import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navmenu',
  standalone: false,
  templateUrl: './navmenu.component.html',
  styleUrl: './navmenu.component.css',
})
export class NavMenuComponent {
  constructor(private _router: Router) {}

  /**
   * Método para rotear o usuário para páginas do menu.
   *
   * @param {string} route - A rota para qual o usuário irá navegar.
   *
   */
  routerNavigation(route: string) {
    this._router.navigateByUrl(`/${route}`);
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
