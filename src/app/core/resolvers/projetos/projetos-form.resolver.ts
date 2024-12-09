import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import { UsuarioService } from '../../services/usuario/usuario.service';

import { IBreadcrumbBotaoAcao } from '../../interfaces/breadcrumb.interface';

export const breadcrumbBotoesAcao_ProjetoFormResolver: ResolveFn<
  IBreadcrumbBotaoAcao
> = (route, state) => {
  const isProponente = inject(UsuarioService).usuarioPerfil.isProponente;

  const botoesArray = isProponente
    ? ['enviar', 'salvar', 'cancelar']
    : ['enviar', 'cancelar'];
	
  const contexto = 'projetos';

  return {
    botoes: botoesArray,
    contexto: contexto,
  };
};
