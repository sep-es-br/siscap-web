import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { finalize, tap } from 'rxjs';

import { UsuarioService } from '../../core/services/usuario/usuario.service';
import { NavegacaoService } from '../../core/services/navegacao/navegacao.service';

import { UsuarioPerfilModel } from '../../core/models/usuario.model';

import { IUsuario } from '../../core/interfaces/usuario.interface';

@Component({
  selector: 'siscap-auth-redirect',
  standalone: false,
  templateUrl: './auth-redirect.component.html',
  styleUrl: './auth-redirect.component.scss',
})
export class AuthRedirectComponent {
  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _usuarioService: UsuarioService,
    private readonly _navegacaoService: NavegacaoService
  ) {
    sessionStorage.setItem(
      'token',
      window.atob(this._route.snapshot.queryParams['token'])
    );

    this._usuarioService
      .buscarUsuario()
      .pipe(
        tap((response: IUsuario) => {
          sessionStorage.setItem('token', response.token);

          this._usuarioService.usuarioPerfil = new UsuarioPerfilModel(response);
        }),
        finalize(() => {
          const destino = this._usuarioService.usuarioPerfil.isProponente
            ? 'projetos'
            : 'home';

          this._navegacaoService.navegacaoSimples(destino);
        })
      )
      .subscribe();
  }
}
