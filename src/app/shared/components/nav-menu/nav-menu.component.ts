import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';

import { BreadcrumbService } from '../../../core/services/breadcrumb/breadcrumb.service';

import {
  IMenuLink,
  MenuLinksHelper,
} from '../../../core/helpers/menu-links.helper';
import { IBreadcrumbItem } from '../../../core/interfaces/breadcrumb.interface';

@Component({
  selector: 'siscap-nav-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, NgbNavModule],
  templateUrl: './nav-menu.component.html',
  styleUrl: './nav-menu.component.scss',
})
export class NavMenuComponent {
  public menuLinks: Array<IMenuLink> = MenuLinksHelper.menuLinks;
  public menuCategoriaAtiva: string = '';
  public subMenuCategoriaAtiva: string = '';

  constructor(private _breadcrumbService: BreadcrumbService) {
    this._breadcrumbService.listaBreadcrumbItems$.subscribe(
      (breadcrumbItemsArray: Array<IBreadcrumbItem>) => {
        const paginaAtual =
          breadcrumbItemsArray[breadcrumbItemsArray.length - 1].caminho;

        this.subMenuCategoriaAtiva =
          this.atualizarSubMenuCategoriaAtiva(paginaAtual);

        this.menuCategoriaAtiva = this.atualizarMenuCategoriaAtiva(
          this.subMenuCategoriaAtiva
        );
      }
    );
  }

  private atualizarSubMenuCategoriaAtiva(paginaAtual: string): string {
    return paginaAtual.includes('/') ? paginaAtual.split('/')[0] : paginaAtual;
  }

  private atualizarMenuCategoriaAtiva(subMenuCategoriaAtiva: string): string {
    return (
      this.menuLinks.find((menuLink) =>
        menuLink.routes.find((route) => route.path === subMenuCategoriaAtiva)
      )?.slug ?? this.menuLinks[0].slug
    );
  }
}
