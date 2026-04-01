import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

import { LoadingService } from '../../../core/services/loading/loading.service';
import { UsuarioService } from '../../../core/services/usuario/usuario.service';
import { AuthenticationService } from '../../../core/services/authentication/authentication.service';
import { PessoasService } from '../../../core/services/pessoas/pessoas.service';
import { NavegacaoService } from '../../../core/services/navegacao/navegacao.service';

import { UsuarioPerfilModel } from '../../../core/models/usuario.model';

import { BreadcrumbContextoEnum } from '../../../core/enums/breadcrumb.enum';

import { converterArrayBufferEmImgSrc } from '../../../core/utils/functions';

@Component({
  selector: 'siscap-user-profile',
  standalone: true,
  imports: [CommonModule, NgbDropdownModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
})
export class UserProfileComponent {
  public usuarioPerfil: UsuarioPerfilModel = new UsuarioPerfilModel();
  public usuarioAvatar: string = '';

  constructor(
    public loadingService: LoadingService,
    private readonly _usuarioService: UsuarioService,
    private readonly _authService: AuthenticationService,
    private readonly _pessoasService: PessoasService,
    private readonly _navegacaoService: NavegacaoService
  ) {
    this.buscarDadosUsuarioPerfil();

    this._usuarioService.atualizarDadosUsuarioPerfil$.subscribe(
      (isAtualizado) => {
        if (isAtualizado) this.buscarDadosUsuarioPerfil();
      }
    );
  }

  public editarMeuPerfil(): void {
    this._pessoasService.subNovoPessoa$.next(this.usuarioPerfil.subNovo);

    this._navegacaoService.navegacaoSimples(
      BreadcrumbContextoEnum.Pessoas,
      'meu-perfil'
    );
  }

  public logOut(): void {
    this._authService.acessoCidadaoSignOut();
  }

  private buscarDadosUsuarioPerfil(): void {
    this.usuarioPerfil = this._usuarioService.usuarioPerfil;
    this.usuarioAvatar = this.usuarioPerfil.imagemPerfil
      ? converterArrayBufferEmImgSrc(this.usuarioPerfil.imagemPerfil)
      : 'assets/images/user.png';
  }
}
