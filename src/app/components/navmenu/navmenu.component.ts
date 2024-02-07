import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navmenu',
  standalone: false,
  templateUrl: './navmenu.component.html',
  styleUrl: './navmenu.component.css',
})
export class NavMenuComponent {
  constructor(private router: Router) {}


  /**
  * Método para rotear o usuário para páginas do menu
  *
  * @param {string} route - A rota para qual o usuário irá navegar
  * 
  */
  routerNavigation(route: string) {
    this.router.navigateByUrl(`/${route}`);
  }
}
