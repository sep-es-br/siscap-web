import { inject } from '@angular/core';
import { CanActivateFn, createUrlTreeFromSnapshot } from '@angular/router';

import { ProjetosService } from '../../services/projetos/projetos.service';
import { map } from 'rxjs';

export const projetos_NoIdEditarGuard: CanActivateFn = (route, state) => {
  const projetosService = inject(ProjetosService);

  return projetosService.idProjeto$.pipe(
    map(idProjetoValue => {
      if (idProjetoValue) {
        return true;
      } else {
        return createUrlTreeFromSnapshot(route, ['..']);
      }
    })
  );
};