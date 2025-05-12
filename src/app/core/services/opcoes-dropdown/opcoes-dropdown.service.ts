import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import {
  ILocalidadeOpcoesDropdown,
  IObjetoOpcoesDropdown,
  IOpcoesDropdown,
  IOpcoesDropdownResponsavelProponente,
  IProjetoPropostoOpcoesDropdown,
  IProspeccaoInteressadoOpcoesDropdown,
} from '../../interfaces/opcoes-dropdown.interface';

import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OpcoesDropdownService {
  
  private readonly _url = `${environment.apiUrl}/destino/opcoes`;

  constructor(private readonly _http: HttpClient) {}

  private getOpcoesDropdown(
    destino: string,
    params?: any
  ): Observable<IOpcoesDropdown[]> {
    const urlDestino = this._url.replace('destino', destino);
    return this._http.get<IOpcoesDropdown[]>(urlDestino, {
      params: params,
    });
  }
  
  private getOpcoesDropdownResponsaveisProponente(
    destino: string,
    params?: any
  ): Observable<IOpcoesDropdownResponsavelProponente[]> {
    const urlDestino = this._url.replace('destino', destino);
    return this._http.get<IOpcoesDropdownResponsavelProponente[]>(urlDestino, {
      params: params,
    });
  }
 
  public getOpcoesPessoas() {
    return this.getOpcoesDropdownResponsaveisProponente('pessoas');
  }

  public getOpcoesPessoasOrganizacao(idOrganizacao: number) {
    const params = {
      idOrganizacao: idOrganizacao,
    };
    return this.getOpcoesDropdownResponsaveisProponente('pessoas', params);
  }

  public getOpcoesPlanos() {
    return this.getOpcoesDropdown('planos');
  }

  public getOpcoesOrganizacoes(filtroTipoOrganizacao?: number) {
    const params = {
      filtroTipoOrganizacao: filtroTipoOrganizacao,
    };

    return filtroTipoOrganizacao
      ? this.getOpcoesDropdown('organizacoes', params)
      : this.getOpcoesDropdown('organizacoes');
  }

  public getOpcoesTiposOrganizacao() {
    return this.getOpcoesDropdown('tipos-organizacao');
  }

  public getOpcoesMicrorregioes() {
    return this.getOpcoesDropdown('microrregioes');
  }

  public getOpcoesPaises() {
    return this.getOpcoesDropdown('paises');
  }

  public getOpcoesEstados(idPais: number) {
    const params = {
      idPais: idPais,
    };
    return this.getOpcoesDropdown('estados', params);
  }

  public getOpcoesCidades(filtrarPor: string, id: number) {
    const params = {
      filtrarPor: filtrarPor,
      id: id,
    };
    return this.getOpcoesDropdown('cidades', params);
  }

  public getOpcoesAreasAtuacao() {
    return this.getOpcoesDropdown('areas-atuacao');
  }

  public getOpcoesTiposPapel() {
    return this.getOpcoesDropdown('tipos-papel');
  }

  public getOpcoesProjetosPropostos() {
    return this.getOpcoesDropdown('projetos') as Observable<
      IProjetoPropostoOpcoesDropdown[]
    >;
  }

  public getOpcoesProgramas() {
    return this.getOpcoesDropdown('programas');
  }

  public getOpcoesTiposValor() {
    return this.getOpcoesDropdown('tipos-valor');
  }

  public getOpcoesObjetos() {
    return this.getOpcoesDropdown('objetos') as Observable<
      IObjetoOpcoesDropdown[]
    >;
  }

  public getOpcoesTiposOperacao() {
    return this.getOpcoesDropdown('tipos-operacao');
  }

  public getOpcoesLocalidades() {
    return this.getOpcoesDropdown('localidades') as Observable<
      ILocalidadeOpcoesDropdown[]
    >;
  }

  public getOpcoesCartasConsulta() {
    return this.getOpcoesDropdown('cartas-consulta');
  }

  public getOpcoesInteressados() {
    return this.getOpcoesDropdown('interessados') as Observable<
      IProspeccaoInteressadoOpcoesDropdown[]
    >;
  }

  public getOpcoesTiposIndicadores() {
    return this.getOpcoesDropdown('tipos-indicador');
  }

}
