import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import { UsuarioService } from '../../services/usuario/usuario.service';

import { IBreadcrumbBotaoAcao } from '../../interfaces/breadcrumb.interface';

export const breadcrumbBotoesAcao_FormResolver: ResolveFn<
  IBreadcrumbBotaoAcao
> = (route, state) => {
  const splitUrl = state.url.split('/');

  const caminho = splitUrl.pop()!;

  const contexto = splitUrl.pop()!;

  const acao = contexto + caminho;

  const permissao = inject(UsuarioService).verificarPermissao(acao);

  const botoesArray = caminho === 'editar' ? [caminho] : ['salvar', 'cancelar'];

  return {
    botoes: permissao ? botoesArray : [],
    contexto: permissao ? contexto : '',
  };
};
