import { MENSAGENS } from '../../utils/constants';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { ToastService } from '../toast/toast.service';

import { IHttpBackEndErrorResponse } from '../../interfaces/http-backend-error-response.interface';
import { ProjetosService } from '../projetos/projetos.service';
import { ProgramasService } from '../programas/programas.service';

import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart
} from '@angular/router';
import { CartasConsultaService } from '../cartas-consulta/cartas-consulta.service';
import { OrganizacoesService } from '../organizacoes/organizacoes.service';
import { PessoasService } from '../pessoas/pessoas.service';

/**
 * @service
 * Serviço para tratar erros de HTTP dentro do sistema. Recolhe erros e utiliza um serviço de toast (`ToastService`) para oferecer feedback ao usuário.
 */
@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {

  private redirecionandoParaLogin = false;

  // constructor(private _toastService: ToastService, private _router: Router,
  //   private _projetosService: ProjetosService,
  //   private _programasService: ProgramasService) { }

  constructor(
    private _toastService: ToastService,
    private _router: Router,
    private _projetosService: ProjetosService,
    private _programasService: ProgramasService,
    private readonly _cartasConsultaService: CartasConsultaService,
    private readonly _organizacoesService: OrganizacoesService,
    private readonly _pessoasService: PessoasService
  ) {

    this._router.events.subscribe(event => {

      if (event instanceof NavigationStart) {
        console.log('[ROUTER] NavigationStart:', event.url);
      }

      if (event instanceof NavigationCancel) {
        console.warn('[ROUTER] NavigationCancel:', {
          url: event.url,
          reason: event.reason,
          code: event.code
        });
      }

      if (event instanceof NavigationError) {
        console.error('[ROUTER] NavigationError:', {
          url: event.url,
          error: event.error
        });
      }

      if (event instanceof NavigationEnd) {
        console.log('[ROUTER] NavigationEnd:', event.urlAfterRedirects);
      }

    });
    
  }

  /**
   * @public
   * Método público invocado dentro dos métodos apropriados dos serviços (ex: `getProjeto` dentro de `ProjetosService`).
   *
   * Cria um toast pelo serviço `ToastService` com as informações provenientes do mapa `ToastErrorInfoMap`. Caso o erro não esteja mapeado,
   * apenas registra o erro no console.
   *
   * Ao momento que o toast expirar ou ser fechado pelo usuário,
   * recebe notificação do `Subject` do serviço e executa métodos opcionais de acordo com o erro, providos em `_handleErrorOptions`.
   *
   * @param {HttpErrorResponse} error - O erro fornecido pelo seletor do operador RxJS `catchError`.
   */
  public handleError(error: HttpErrorResponse): void {
    if (error.status === 0) {
      this.showDefaultErrorToast();
    } else {
      this.showBackEndErrorToast(error.error);
      this.handleRouting(error);
    }
  }

  private showDefaultErrorToast(): void {
    this._toastService.showToast('error', MENSAGENS.ERRO_AO_PROCESSAR_A_REQUISICAO, [
      MENSAGENS.VERIFIQUE_SUA_CONEXAO_COM_A_INTERNET,
      MENSAGENS.CASO_O_ERRO_PERSISTA_CONTATE_O_SUPORTE,
    ]);
  }

  private showBackEndErrorToast(backEndError: IHttpBackEndErrorResponse): void {
    this._toastService.showToast(
      'error',
      backEndError.mensagem,
      backEndError.erros
    );
  }

  // private handleRouting(error: HttpErrorResponse): void {
  //   const isErroTokenEdocs = error.status === 401 && error.error?.titulo === 'EDOCS_TOKEN_EXPIRADO';
  //   if (isErroTokenEdocs) {
  //     this._toastService.showToast(
  //       'error',
  //       error.error?.erros?.[0] ??
  //       MENSAGENS.SUA_PERMISSAO_DE_ACESSO_AO_E_DOCS_EXPIROU_VOCE_SERA_REDIRECIONADO_PARA_O_LOGIN
  //     );
  //     setTimeout(() => {
  //       this._router.navigateByUrl('login');
  //     }, 2000);
  //     return;
  //   }
  //   switch (error.status) {
  //     case 401:
  //       this._router.navigateByUrl('login');
  //       break;
  //     case 403:
  //       this._router.navigateByUrl('main');
  //       break;
  //     default:
  //       break;
  //   }
  // }

  private handleRouting(error: HttpErrorResponse): void {
   
    if (error.status === 403) {
      this._router.navigateByUrl('/main');
      return;
    }

    if (error.status !== 401) {
      return;
    }

    // Evita múltiplos redirecionamentos simultâneos.
    if (this.redirecionandoParaLogin) {
      return;
    }

    // const rotaAtual = this._router.url;
    const rotaAtual = this.obterRotaRetorno();

    console.log('[401] Rota capturada:', rotaAtual);
    console.log('[401] Redirecionamento em andamento:', this.redirecionandoParaLogin);

    // Não captura a rota de login ou de retorno da autenticação.
    if (
      rotaAtual === '/login' ||
      rotaAtual.startsWith('/login?') ||
      rotaAtual === '/token' ||
      rotaAtual.startsWith('/token?')
    ) {
      return;
    }

    this.redirecionandoParaLogin = true;

    // Preserva temporariamente a rota original.
    sessionStorage.setItem('redirectUrl', rotaAtual);

    console.log(
      '[401] Rota armazenada:',
      sessionStorage.getItem('redirectUrl')
    );

    const isErroTokenEdocs =
      error.error?.titulo === 'EDOCS_TOKEN_EXPIRADO';

    if (isErroTokenEdocs) {

      this._toastService.showToast(
        'error',
        error.error?.erros?.[0] ??
        MENSAGENS.SUA_PERMISSAO_DE_ACESSO_AO_E_DOCS_EXPIROU_VOCE_SERA_REDIRECIONADO_PARA_O_LOGIN
      );

      setTimeout(() => {
        this._router.navigateByUrl('/login');
      }, 2000);

      return;
    }
   
    this._router.navigateByUrl('/login').then(sucesso => {
      console.log('[401] Navegação para login:', sucesso);
      console.log('[401] Rota após navegação:', this._router.url);
    });

  }

  private obterRotaRetorno(): string {

    const rotaAtual = this._router.url;

    const [pathname, queryString] = rotaAtual.split('?', 2);

    if (pathname === '/main/projetos/editar') {
      const idProjeto = this._projetosService.idProjeto$.getValue();

      if (idProjeto > 0) {
        return `/main/projetos/editar/${idProjeto}${queryString ? `?${queryString}` : ''
          }`;
      }
    }

    if (pathname === '/main/programas/editar') {
      const idPrograma = this._programasService.idPrograma$.getValue();

      if (idPrograma > 0) {
        return `/main/programas/editar/${idPrograma}${queryString ? `?${queryString}` : ''
          }`;
      }
    }

    if (pathname === '/main/cartasconsulta/editar') {
      const idPesquisa = this._cartasConsultaService.idCartaConsulta$.getValue();

      if (idPesquisa > 0) {
        return `/main/cartasconsulta/editar/${idPesquisa}${queryString ? `?${queryString}` : ''
          }`;
      }
    }

    if (pathname === '/main/organizacoes/editar') {
      const idOrganizacao = this._organizacoesService.idOrganizacao$.getValue();

      if (idOrganizacao > 0) {
        return `/main/organizacoes/editar/${idOrganizacao}${queryString ? `?${queryString}` : ''
          }`;
      }
    }

    if (pathname === '/main/pessoas/editar') {
      const idPessoa = this._pessoasService.idPessoa$.getValue();

      if (idPessoa > 0) {
        return `/main/pessoas/editar/${idPessoa}${queryString ? `?${queryString}` : ''
          }`;
      }
    }

    return rotaAtual;

  }


}
