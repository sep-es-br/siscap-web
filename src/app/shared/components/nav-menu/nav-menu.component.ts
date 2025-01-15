import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';

import { LoadingService } from '../../../core/services/loading/loading.service';

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
    private readonly _router: Router
  ) {}

  public avaliarNavegacaoMesmaRota(rota: string): void {
    const caminhoAtual = this.getCaminhoAtual();

    rota === caminhoAtual
      ? this.executarNavegacaoComRecarregamento(rota)
      : this.executarNavegacaoSimples(rota);
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
