import { ResolveFn } from '@angular/router';

import { IBreadcrumbBotaoAcao } from '../../interfaces/breadcrumb.interface';

export const breadcrumbBotoesAcao_PropostaFormResolver: ResolveFn<
  IBreadcrumbBotaoAcao
> = (route, state) => {
  const botoesArray = ['enviar', 'salvar', 'cancelar'];
  const contexto = 'propostas';

  return {
    botoes: botoesArray,
    contexto: contexto,
  };
};
