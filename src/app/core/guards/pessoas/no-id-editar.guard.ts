import { inject } from '@angular/core';
import { CanActivateFn, createUrlTreeFromSnapshot } from '@angular/router';

import { PessoasService } from '../../services/pessoas/pessoas.service';

export const pessoas_NoIdEditarGuard: CanActivateFn = (route, state) => {
  const idPessoaValue: number = inject(PessoasService).idPessoa$.value;

  if (idPessoaValue) {
    return true;
  }

  return createUrlTreeFromSnapshot(route, ['..']);
};