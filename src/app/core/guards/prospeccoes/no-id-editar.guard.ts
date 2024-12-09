import { inject } from '@angular/core';
import { CanActivateFn, createUrlTreeFromSnapshot } from '@angular/router';

import { ProspeccoesService } from '../../services/prospeccoes/prospeccoes.service';

export const prospeccoes_NoIdEditarGuard: CanActivateFn = (route, state) => {
  const idProspeccaoValue: number =
    inject(ProspeccoesService).idProspeccao$.value;

  if (idProspeccaoValue) {
    return true;
  }

  return createUrlTreeFromSnapshot(route, ['..']);
};
