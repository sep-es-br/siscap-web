import { inject } from '@angular/core';
import { CanActivateFn, createUrlTreeFromSnapshot } from '@angular/router';

import { ProgramasService } from '../../services/programas/programas.service';

export const programas_NoIdEditarGuard: CanActivateFn = (route, state) => {

  const idProgramaValue: number =
    inject(ProgramasService).idPrograma$.value;

  console.log('[GUARD PROGRAMAS] Executado:', {
    url: state.url,
    idPrograma: idProgramaValue
  });

  if (idProgramaValue) {
    console.log('[GUARD PROGRAMAS] Acesso permitido');
    return true;
  }

  console.warn('[GUARD PROGRAMAS] Redirecionando para listagem');

  return createUrlTreeFromSnapshot(route, ['..']);
};
