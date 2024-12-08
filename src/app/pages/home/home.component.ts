import { Component } from '@angular/core';

import { UsuarioService } from '../../core/services/usuario/usuario.service';
import { TesteUsuarioRolesService } from '../../core/services/testeusuarioroles/testeusuarioroles.service';

declare type ITeste = {
  ConjuntoPai: string;
};

@Component({
  selector: 'siscap-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private cpf_eu: string = '14744812724';
  private cpf_marquinhos: string = '07461234773';
  private cpf_diego: string = '87063000225';
  private cpf_vagner: string = '';

  constructor(
    private _usuarioService: UsuarioService,
    private _testeUsuarioRolesService: TesteUsuarioRolesService
  ) {}

  public botaoPapeisPorSub(): void {
    const subNovo = this._usuarioService.usuarioPerfil.subNovo;

    this.resultadoListarPapeisAgentePublicoPorSub(subNovo);
  }

  public botaoUnidadeInfo(): void {
    // DADO COLETADO CHAMANDO listarPapeisAgentePublicoPorSub USANDO SUB DO USUARIO LOGADO
    // VEIO TODO EM CAPS LOCK, USAR toLowerCase()
    const lotacaoGuid = 'D2AB305B-3F41-4802-B509-09F447AB3016';

    this.resultadoUnidadeInfo(lotacaoGuid.toLowerCase());
  }

  public botaoDadosOrganizacao(): void {
    // DADO COLETADO CHAMANDO buscarUnidadeInfoPorLotacaoGuid USANDO "LotacaoGuid" DO PAPEL DO USUARIO LOGADO
    const guidOrganizacao = '6db334b7-05ea-49fe-a33a-bf0a19e96670';

    this.resultadoDadosOrganizacao(guidOrganizacao);
  }

  private resultadoListarPapeisAgentePublicoPorSub(sub: string): void {
    this._testeUsuarioRolesService
      .listarPapeisAgentePublicoPorSub(sub)
      .subscribe((resposta) => {
        console.log(resposta);
      });
  }

  private resultadoUnidadeInfo(lotacaoGuid: string): void {
    this._testeUsuarioRolesService
      .buscarUnidadeInfoPorLotacaoGuid(lotacaoGuid)
      .subscribe((resposta) => {
        console.log(resposta);
      });
  }

  private resultadoDadosOrganizacao(guid: string): void {
    this._testeUsuarioRolesService
      .buscarDadosOrganizacaoPorGuid(guid)
      .subscribe((resposta) => {
        console.log(resposta);
      });
  }
}
