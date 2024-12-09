import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import { UsuarioService } from '../../services/usuario/usuario.service';

import { IBreadcrumbBotaoAcao } from '../../interfaces/breadcrumb.interface';

export const breadcrumbBotoesAcao_ListResolver: ResolveFn<
  IBreadcrumbBotaoAcao
> = (route, state) => {
  const splitUrl = state.url.split('/');

  const caminho = 'criar';

  const contexto = splitUrl.pop()!;

  const acao = contexto + caminho;

  const permissao = inject(UsuarioService).verificarPermissao(acao);

  return {
    botoes: permissao ? ['criar'] : [],
    contexto: permissao ? contexto : '',
  };
};
