import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  constructor() {}

  showMenu() {
    const navMenuEl = document.getElementById('nav-menu')!.classList;
    const responsiveContentEl =
      document.getElementById('responsive-content')!.classList;

    navMenuEl.remove('d-none');
    responsiveContentEl.add('d-none');
  }
}
