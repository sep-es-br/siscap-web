import { MENSAGENS, formatarMensagem } from '../../core/utils/constants';
import { Component } from '@angular/core';

import { UsuarioService } from '../../core/services/usuario/usuario.service';

@Component({
  selector: 'siscap-main',
  standalone: false,
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent {
  public readonly MENSAGENS = MENSAGENS;
  public readonly formatarMensagem = formatarMensagem;

  public isProponente: boolean = false;

  currentYear: number = 2024;

  constructor(private readonly _usuarioService: UsuarioService) {
    this.isProponente = this._usuarioService.usuarioPerfil.isProponente;

    this.currentYear = new Date().getFullYear();
  }
}
