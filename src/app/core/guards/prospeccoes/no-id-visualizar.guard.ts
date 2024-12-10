import { inject } from '@angular/core';
import { CanActivateFn, createUrlTreeFromSnapshot } from '@angular/router';

import { ProspeccoesService } from '../../services/prospeccoes/prospeccoes.service';

export const prospeccoes_NoIdVisualizarGuard: CanActivateFn = (
  route,
  state
) => {
  const idProspeccaoDetalhesValue: number =
    inject(ProspeccoesService).idProspeccaoDetalhes$.value;

  if (idProspeccaoDetalhesValue) {
    return true;
  }

  return createUrlTreeFromSnapshot(route, ['..']);
};
