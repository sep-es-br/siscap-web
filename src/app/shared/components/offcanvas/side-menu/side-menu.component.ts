import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';

import { OffcanvasNavMenuComponent } from '../nav-menu/nav-menu.component';
import { OffcanvasUserProfileComponent } from '../user-profile/user-profile.component';

@Component({
  selector: 'siscap-side-menu',
  standalone: true,
  imports: [
    CommonModule,
    OffcanvasNavMenuComponent,
    OffcanvasUserProfileComponent,
  ],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.scss',
})
export class SideMenuComponent {
  @Input() public menuCategoriaAtiva: string = '';
  @Input() public subMenuCategoriaAtiva: string = '';

  constructor(private readonly _ngbOffcanvasService: NgbOffcanvas) {}

  public fecharSideMenuOffcanvas(): void {
    this._ngbOffcanvasService.dismiss();
  }
}
