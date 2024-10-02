import { Component } from '@angular/core';

import { NavMenuComponent } from '../nav-menu/nav-menu.component';
import { UserProfileComponent } from '../user-profile/user-profile.component';

@Component({
  selector: 'siscap-header',
  standalone: true,
  imports: [NavMenuComponent, UserProfileComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {}
