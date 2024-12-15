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
  private cpf_thassia: string = '10593184742';

  private foco_thassia = {
    cpf: '10593184742',
    subNovo: '4935701b-37cf-4638-ab23-b3f6b464547d',
    papeisLotacaoGuidMap: [
      '9414b935-62a7-4955-8d6a-0d40208345a4',
      '515685f7-2aeb-4cc4-a311-8b793297f8fb',
      '07a0462f-6b02-4b98-b86d-18d7e4fa543a',
      '515685f7-2aeb-4cc4-a311-8b793297f8fb',
      '07a0462f-6b02-4b98-b86d-18d7e4fa543a',
    ],
  };

  constructor(
    private _usuarioService: UsuarioService,
    private _testeUsuarioRolesService: TesteUsuarioRolesService
  ) {}

  public botaoSubAgentePublicoPorCpf(): void {
    this.resultadoSubAgentePublicoPorCpf(this.cpf_thassia);
  }

  public botaoPapeisPorSub(): void {
    const subNovo = this._usuarioService.usuarioPerfil.subNovo;

    // DADO COLETADO CHAMANDO buscarSubAgentePublicoPorCpf USANDO CPF DA THASSIAs
    const sub_thassia = '4935701b-37cf-4638-ab23-b3f6b464547d';

    this.resultadoListarPapeisAgentePublicoPorSub(sub_thassia);
  }

  public botaoUnidadeInfo(): void {
    // DADO COLETADO CHAMANDO listarPapeisAgentePublicoPorSub USANDO SUB DO USUARIO LOGADO
    // VEIO TODO EM CAPS LOCK, USAR toLowerCase()
    const lotacaoGuid = 'D2AB305B-3F41-4802-B509-09F447AB3016';

    this.foco_thassia.papeisLotacaoGuidMap.forEach((guid) => {
      this.resultadoUnidadeInfo(guid);
    });

    // this.resultadoUnidadeInfo(lotacaoGuid.toLowerCase());
  }

  public botaoDadosOrganizacao(): void {
    // DADO COLETADO CHAMANDO buscarUnidadeInfoPorLotacaoGuid USANDO "LotacaoGuid" DO PAPEL DO USUARIO LOGADO
    const guidOrganizacao = '6db334b7-05ea-49fe-a33a-bf0a19e96670';

    this.resultadoDadosOrganizacao(guidOrganizacao);
  }

  private resultadoSubAgentePublicoPorCpf(cpf: string): void {
    this._testeUsuarioRolesService
      .buscarSubAgentePublicoPorCpf(cpf)
      .subscribe((resposta) => {
        console.log(resposta);
      });
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
