import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, Subject } from 'rxjs';

import { UsuarioPerfilModel } from '../../models/usuario.model';

import { IUsuario } from '../../interfaces/usuario.interface';

import { PermissoesEnum } from '../../enums/permissoes.enum';

import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private _url = `${environment.apiUrl}/signin/user-info`;

  public get usuarioPerfil(): UsuarioPerfilModel {
    return new UsuarioPerfilModel(
      sessionStorage.getItem('usuario-perfil')
        ? (JSON.parse(
            sessionStorage.getItem('usuario-perfil') as string
          ) as IUsuario)
        : undefined
    );
  }

  public set usuarioPerfil(usuarioPerfilModel: UsuarioPerfilModel) {
    sessionStorage.setItem(
      'usuario-perfil',
      JSON.stringify(usuarioPerfilModel)
    );
  }

  public atualizarDadosUsuarioPerfil$: Subject<boolean> =
    new Subject<boolean>();

  constructor(private _http: HttpClient) {}

  public buscarUsuario(): Observable<IUsuario> {
    return this._http.get<IUsuario>(`${this._url}`);
  }

  public verificarPermissao(acao: string): boolean {
    const usuarioPermissoes = this.usuarioPerfil.permissoes;

    if (usuarioPermissoes.includes(PermissoesEnum.adminAuth)) {
      return true;
    }

    return usuarioPermissoes.includes(
      PermissoesEnum[acao as keyof typeof PermissoesEnum]
    );
  }
}
