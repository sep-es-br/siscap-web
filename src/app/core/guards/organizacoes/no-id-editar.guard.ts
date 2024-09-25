import { inject } from '@angular/core';
import { CanActivateFn, createUrlTreeFromSnapshot } from '@angular/router';

import { OrganizacoesService } from '../../services/organizacoes/organizacoes.service';

export const organizacoes_NoIdEditarGuard: CanActivateFn = (route, state) => {
  const idOrganizacaoValue: number =
    inject(OrganizacoesService).idOrganizacao$.value;

  if (idOrganizacaoValue) {
    return true;
  }

  return createUrlTreeFromSnapshot(route, ['..']);
};
