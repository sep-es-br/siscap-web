import { Component, Input, TemplateRef } from '@angular/core';

import { NavMenuLinks } from '../../shared/utils/navmenu-links';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'siscap-navmenu',
  standalone: false,
  templateUrl: './navmenu.component.html',
  styleUrl: './navmenu.component.scss',
})
export class NavMenuComponent {
  @Input('offcanvasRef') navmenuOffcanvas!: TemplateRef<any>;

  public menuLinks = NavMenuLinks.menuLinks;

  constructor(private _offcanvasService: NgbOffcanvas) {}

  dismissOffcanvas() {
    this._offcanvasService.dismiss(this.navmenuOffcanvas);
  }
}
