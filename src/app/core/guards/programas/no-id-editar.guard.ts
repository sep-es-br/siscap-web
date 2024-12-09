import { inject } from '@angular/core';
import { CanActivateFn, createUrlTreeFromSnapshot } from '@angular/router';

import { ProgramasService } from '../../services/programas/programas.service';

export const programas_NoIdEditarGuard: CanActivateFn = (route, state) => {
  const idProgramaValue: number = inject(ProgramasService).idPrograma$.value;

  if (idProgramaValue) {
    return true;
  }

  return createUrlTreeFromSnapshot(route, ['..']);
};
