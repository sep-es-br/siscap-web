import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';

import { LoadingService } from '../../../core/services/loading/loading.service';
import { NavegacaoService } from '../../../core/services/navegacao/navegacao.service';

import {
  IMenuLink,
  MenuLinksHelper,
} from '../../../core/helpers/menu-links.helper';

@Component({
  selector: 'siscap-nav-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, NgbNavModule],
  templateUrl: './nav-menu.component.html',
  styleUrl: './nav-menu.component.scss',
})
export class NavMenuComponent {
  @Input() public menuCategoriaAtiva: string = '';
  @Input() public subMenuCategoriaAtiva: string = '';

  public menuLinks: Array<IMenuLink> = MenuLinksHelper.menuLinks;

  constructor(
    public loadingService: LoadingService,
    private readonly _navegacaoService: NavegacaoService
  ) {}

  public avaliarNavegacaoMesmaRota(rota: string): void {
    rota === this._navegacaoService.buscarRotaCaminhoAtual()
      ? this._navegacaoService.navegacaoComRecarregamento(rota)
      : this._navegacaoService.navegacaoSimples(rota);
  }
}
