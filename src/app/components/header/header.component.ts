import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  constructor(private _router: Router) {}

  showMenu() {
    const navMenuEl = document.getElementById('nav-menu')!.classList;
    const responsiveContentEl =
      document.getElementById('responsive-content')!.classList;

    navMenuEl.remove('d-none');
    responsiveContentEl.add('d-none');
  }

  logOut() {
    localStorage.removeItem('token');
    this._router.navigate(['']);
  }
}
