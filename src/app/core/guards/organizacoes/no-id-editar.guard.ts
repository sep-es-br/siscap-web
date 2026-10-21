
import { inject } from '@angular/core';
import {
  CanActivateFn,
  createUrlTreeFromSnapshot
} from '@angular/router';

import { OrganizacoesService } from '../../services/organizacoes/organizacoes.service';

export const organizacoes_NoIdEditarGuard: CanActivateFn = (route, state) => {

  const organizacoesService = inject(OrganizacoesService);

  // Primeiro verifica se existe um ID válido na URL.
  const idParam = route.paramMap.get('id');

  if (idParam !== null) {
    const idOrganizacao = Number(idParam);

    if (Number.isInteger(idOrganizacao) && idOrganizacao > 0) {
      organizacoesService.idOrganizacao$.next(idOrganizacao);
      return true;
    }

    return createUrlTreeFromSnapshot(route, ['..']);
  }

  // Mantém o comportamento da navegação interna sem ID.
  const idOrganizacaoValue = organizacoesService.idOrganizacao$.value;

  if (idOrganizacaoValue > 0) {
    return true;
  }

  return createUrlTreeFromSnapshot(route, ['..']);
  
};
