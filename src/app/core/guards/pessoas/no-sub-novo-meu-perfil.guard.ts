import { inject } from '@angular/core';
import { CanActivateFn, createUrlTreeFromSnapshot } from '@angular/router';

import { PessoasService } from '../../services/pessoas/pessoas.service';

export const pessoas_NoSubNovoMeuPerfilGuard: CanActivateFn = (
  route,
  state
) => {
  const subNovoPessoaValue: string =
    inject(PessoasService).subNovoPessoa$.value;

  if (subNovoPessoaValue) {
    return true;
  }

  return createUrlTreeFromSnapshot(route, ['..']);
};
