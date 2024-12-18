import { Component } from '@angular/core';

import { UsuarioService } from '../../core/services/usuario/usuario.service';

@Component({
  selector: 'siscap-main',
  standalone: false,
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent {
  public isProponente: boolean = false;

  constructor(private readonly _usuarioService: UsuarioService) {
    this.isProponente = this._usuarioService.usuarioPerfil.isProponente;
  }
}
