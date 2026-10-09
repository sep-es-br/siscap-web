import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { UsuarioService } from '../../core/services/usuario/usuario.service';

import { UsuarioPerfilModel } from '../../core/models/usuario.model';

import { IUsuario } from '../../core/interfaces/usuario.interface';

@Component({
  selector: 'siscap-auth-redirect',
  standalone: false,
  templateUrl: './auth-redirect.component.html',
  styleUrl: './auth-redirect.component.scss',
})
export class AuthRedirectComponent implements OnInit {

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _usuarioService: UsuarioService,
    private readonly _router: Router,
  ) { }

  ngOnInit(): void {

    const tokenParam =
      this._route.snapshot.queryParamMap.get('token');

    if (!tokenParam) {
      return;
    }

    const tokenRecebido = window.atob(tokenParam);

    sessionStorage.setItem('token', tokenRecebido);

    this._usuarioService.buscarUsuario().subscribe({

      next: (response: IUsuario) => {

        sessionStorage.setItem('token', response.token);

        this._usuarioService.usuarioPerfil =
          new UsuarioPerfilModel(response);

        const returnUrl =
          this._route.snapshot.queryParamMap.get('returnUrl');

        if (returnUrl) {
          this._router.navigateByUrl(returnUrl);
          return;
        }

        const destino =
          this._usuarioService.usuarioPerfil.isProponente
            ? '/projetos'
            : '/home';

        this._router.navigate([destino]);
      },

    });

  }
  
}