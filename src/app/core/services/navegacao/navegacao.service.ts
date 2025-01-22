import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class NavegacaoService {
  private readonly _rotaPrincipal: Array<string> = ['main'];

  constructor(private readonly _router: Router) {}

  public navegacaoSimples(...rotas: Array<string>): void {
    this._router.navigate(this._rotaPrincipal.concat(rotas));
  }

  public navegacaoComRecarregamento(...rotas: Array<string>): void {
    this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.navegacaoSimples(...rotas);
    });
  }

  public buscarRotaCaminhoAtual(): string | undefined {
    return this._router.url.split('/').pop();
  }
}
