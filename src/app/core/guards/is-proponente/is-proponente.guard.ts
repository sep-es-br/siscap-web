import { inject } from '@angular/core';
import { CanActivateChildFn, createUrlTreeFromSnapshot } from '@angular/router';

import { UsuarioService } from '../../services/usuario/usuario.service';

export const isProponenteGuard: CanActivateChildFn = (route, state) => {
  const isProponente = inject(UsuarioService).usuarioPerfil.isProponente;

  if (!isProponente) return true;

  return createUrlTreeFromSnapshot(route, ['..', 'projetos']);
};
