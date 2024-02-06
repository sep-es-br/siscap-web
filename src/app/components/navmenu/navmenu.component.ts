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

  placeholderNavigate() {
    console.log('rota ainda não estabelecida');
  }

  navigateProjectsList() {
    this.router.navigateByUrl('/projects/list');
  }
}
