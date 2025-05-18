import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, catchError, finalize, Observable, of, shareReplay, tap } from 'rxjs';

import { BaseHttpService } from '../http/base-http.service';

import { PessoaFormModel } from '../../models/pessoa.model';
import { BotaoPropriedadesModel } from '../../../shared/components/botao/botao.model';

import { BotoesConfig } from '../../../shared/components/botao/botao.config';

import {
  IPessoa,
  IPessoaAcessoCidadao,
  IPessoaTableData,
} from '../../interfaces/pessoa.interface';
import { IOpcoesDropdown, IOpcoesDropdownResponsavelProponente } from '../../interfaces/opcoes-dropdown.interface';

import { FormDataHelper } from '../../helpers/form-data.helper';

import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PessoasService extends BaseHttpService<IPessoa, IPessoaTableData> {
  private readonly _url = `${environment.apiUrl}/pessoas`;

  private readonly _idPessoa$: BehaviorSubject<number> =
    new BehaviorSubject<number>(0);

  private readonly _subNovoPessoa$: BehaviorSubject<string> =
    new BehaviorSubject<string>('');

   // 
   private cache$: Observable<IOpcoesDropdownResponsavelProponente[]> | null = null;
   private cacheLoaded = false;

  public get idPessoa$(): BehaviorSubject<number> {
    return this._idPessoa$;
  }

  public get subNovoPessoa$(): BehaviorSubject<string> {
    return this._subNovoPessoa$;
  }

  constructor(private readonly _http: HttpClient) {
    super(_http, 'pessoas');
  }

  public gerarBotoesAcaoListagem(): Array<BotaoPropriedadesModel> {
    const botaoCriar = BotoesConfig.gerarBotaoPropriedades('criar', {
      texto: 'Nova Pessoa',
    });

    return [botaoCriar];
  }

  public gerarBotoesAcaoFormulario(): Array<BotaoPropriedadesModel> {
    const botaoSalvar = BotoesConfig.gerarBotaoPropriedades('salvar');
    const botaoCancelar = BotoesConfig.gerarBotaoPropriedades('cancelar');

    return [botaoSalvar, botaoCancelar];
  }

  public post(body: PessoaFormModel, imagemPerfil?: File): Observable<IPessoa> {
    return this._http.post<IPessoa>(
      this._url,
      this.construirFormData(body, imagemPerfil)
    );
  }

  public put(
    id: number,
    body: PessoaFormModel,
    imagemPerfil?: File
  ): Observable<IPessoa> {
    return this._http.put<IPessoa>(
      `${this._url}/${id}`,
      this.construirFormData(body, imagemPerfil)
    );
  }

  public buscarPessoaNoAcessoCidadaoPorCpf(
    cpf: string
  ): Observable<IPessoaAcessoCidadao> {
    return this._http.get<IPessoaAcessoCidadao>(
      `${this._url}/acesso-cidadao/${cpf}`
    );
  }

  public buscarResponsavelPorIdOrganizacao(
    idOrganizacao: number
  ): Observable<IOpcoesDropdown> {
    return this._http.get<IOpcoesDropdown>(
      `${this._url}/responsavel/${idOrganizacao}`
    );
  }

  public buscarResponsavelPorIdOrganizacaoAC(
    idOrganizacao: number
  ): Observable<IOpcoesDropdownResponsavelProponente[]> {
    return this._http.get<IOpcoesDropdownResponsavelProponente[]>(
      `${this._url}/opcoes/${idOrganizacao}`
    );
  }

  /*
  public buscarTodosAgentesPublicosGoves(): 

    Observable<IOpcoesDropdownResponsavelProponente[]> {

      if ( !this.cache$ || this.cache$ === of([]) ) {

        this.cache$ = this._http.get<IOpcoesDropdownResponsavelProponente[]>(
          `${this._url}/opcoes/agentesGoves` 
          ).pipe(shareReplay(1)); // Cache em memória

      }

      return this.cache$;

  }
  */

  public buscarTodosAgentesPublicosGoves(): Observable<IOpcoesDropdownResponsavelProponente[]> {
    
    console.log("Método chamado");
    
    if (!this.cacheLoaded) { // 👈 Usamos a flag em vez de comparar Observables
        
      console.log("Fazendo requisição ao backend...");

      this.cache$ = this._http.get<IOpcoesDropdownResponsavelProponente[]>(
            `${this._url}/opcoes/agentesGoves`
        ).pipe(
            tap(data => console.log('Dados recebidos:', data)), // 👈 Debug dos dados
            catchError(err => {
                console.error('Erro na requisição:', err);
                return of([]); // Fallback
            }),
            shareReplay(1),
            finalize(() => this.cacheLoaded = true) // 👈 Marca como carregado
        );
    }
    return this.cache$!; // 👈 Non-null assertion (só use se tiver certeza)
  }


  public buscarMeuPerfil(subNovo: string): Observable<IPessoa> {
    const params = {
      subNovo: subNovo,
    };

    return this._http.get<IPessoa>(`${this._url}/meu-perfil`, {
      params: params,
    });
  }

  public atualizarMeuPerfil(
    id: number,
    body: PessoaFormModel,
    imagemPerfil?: File
  ): Observable<IPessoa> {
    return this._http.put<IPessoa>(
      `${this._url}/meu-perfil/${id}`,
      this.construirFormData(body, imagemPerfil)
    );
  }

  private construirFormData(
    body: PessoaFormModel,
    imagemPerfil?: File
  ): FormData {
    const formData = FormDataHelper.appendFormGrouptoFormData(body, 'endereco');

    if (imagemPerfil) {
      formData.append('imagemPerfil', imagemPerfil);
    }

    return formData;
  }

  // pessoas.service.ts
  filtrarAgentesPublicos(termo: string): Observable<IOpcoesDropdownResponsavelProponente[]> {
    return this._http.get<IOpcoesDropdownResponsavelProponente[]>(
      `${this._url}/opcoes/agentesGoves?filter=${termo}`
      );
  }

  ngOnDestroy() {
    this.cache$ = null;
  }

}
