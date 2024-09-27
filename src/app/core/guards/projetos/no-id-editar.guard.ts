import { inject } from '@angular/core';
import { CanActivateFn, createUrlTreeFromSnapshot } from '@angular/router';

import { ProjetosService } from '../../services/projetos/projetos.service';

export const projetos_NoIdEditarGuard: CanActivateFn = (route, state) => {
  const idProjetoValue: number = inject(ProjetosService).idProjeto$.value;

  if (idProjetoValue) {
    return true;
  }

  return createUrlTreeFromSnapshot(route, ['..']);
};