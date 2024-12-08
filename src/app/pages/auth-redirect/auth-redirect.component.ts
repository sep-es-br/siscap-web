import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { finalize, tap } from 'rxjs';

import { UsuarioService } from '../../core/services/usuario/usuario.service';

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
    private _router: Router,
    private _route: ActivatedRoute,
    private _usuarioService: UsuarioService
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
            ? 'propostas'
            : 'home';

          this._router.navigate(['main', destino]);
        })
      )
      .subscribe();
  }
}
