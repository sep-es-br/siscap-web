import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';

import {
  IMenuLink,
  MenuLinksHelper,
} from '../../../../core/helpers/menu-links.helper';

@Component({
  selector: 'siscap-offcanvas-nav-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, NgbAccordionModule],
  templateUrl: './nav-menu.component.html',
  styleUrl: './nav-menu.component.scss',
})
export class OffcanvasNavMenuComponent {
  @Input() public menuCategoriaAtiva: string = '';
  @Input() public subMenuCategoriaAtiva: string = '';

  @Output() public navegacaoSideMenu: EventEmitter<void> =
    new EventEmitter<void>();

  public menuLinks: Array<IMenuLink> = MenuLinksHelper.menuLinks;

  constructor(private readonly _router: Router) {}

  public avaliarNavegacaoMesmaRota(rota: string): void {
    const caminhoAtual = this.getCaminhoAtual();

    rota === caminhoAtual
      ? this.executarNavegacaoComRecarregamento(rota)
      : this.executarNavegacaoSimples(rota);

    this.navegacaoSideMenu.emit();
  }

  private getCaminhoAtual(): string | undefined {
    return this._router.url.split('/').pop();
  }

  private executarNavegacaoSimples(rota: string): void {
    this._router.navigateByUrl(`/main/${rota}`);
  }

  private executarNavegacaoComRecarregamento(rota: string): void {
    this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this._router.navigateByUrl(`/main/${rota}`);
    });
  }
}
