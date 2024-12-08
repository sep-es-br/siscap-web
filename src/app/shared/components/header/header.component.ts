import { Component } from '@angular/core';

import { NgbOffcanvas, NgbOffcanvasRef } from '@ng-bootstrap/ng-bootstrap';

import { SideMenuComponent } from '../offcanvas/side-menu/side-menu.component';
import { NavMenuComponent } from '../nav-menu/nav-menu.component';
import { UserProfileComponent } from '../user-profile/user-profile.component';

import { BreadcrumbService } from '../../../core/services/breadcrumb/breadcrumb.service';

import { IBreadcrumbItem } from '../../../core/interfaces/breadcrumb.interface';

import {
  IMenuLink,
  MenuLinksHelper,
} from '../../../core/helpers/menu-links.helper';
import { UsuarioService } from '../../../core/services/usuario/usuario.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'siscap-header',
  standalone: true,
  imports: [CommonModule, NavMenuComponent, UserProfileComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  public menuLinks: Array<IMenuLink> = MenuLinksHelper.menuLinks;
  public menuCategoriaAtiva: string = '';
  public subMenuCategoriaAtiva: string = '';
  public isProponente: boolean = false;

  private _sideMenuOffcanvasRef: NgbOffcanvasRef | null = null;

  constructor(
    private readonly _usuarioService: UsuarioService,
    private readonly _breadcrumbService: BreadcrumbService,
    private readonly _ngbOffcanvasService: NgbOffcanvas
  ) {
    this.isProponente = this._usuarioService.usuarioPerfil.isProponente;

    this._breadcrumbService.listaBreadcrumbItems$.subscribe(
      (breadcrumbItemsArray: Array<IBreadcrumbItem>) => {
        const paginaAtual =
          breadcrumbItemsArray[breadcrumbItemsArray.length - 1].caminho;

        this.subMenuCategoriaAtiva =
          this.atualizarSubMenuCategoriaAtiva(paginaAtual);

        this.menuCategoriaAtiva = this.atualizarMenuCategoriaAtiva(
          this.subMenuCategoriaAtiva
        );

        this.atualizarInputsSideMenuOffcanvasRef();
      }
    );
  }

  public abrirSideMenuOffcanvas(): void {
    this._sideMenuOffcanvasRef =
      this._ngbOffcanvasService.open(SideMenuComponent);

    this.atualizarInputsSideMenuOffcanvasRef();
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

  private atualizarInputsSideMenuOffcanvasRef(): void {
    if (this._sideMenuOffcanvasRef) {
      this._sideMenuOffcanvasRef.componentInstance.menuCategoriaAtiva =
        this.menuCategoriaAtiva;
      this._sideMenuOffcanvasRef.componentInstance.subMenuCategoriaAtiva =
        this.subMenuCategoriaAtiva;
    }
  }
}
