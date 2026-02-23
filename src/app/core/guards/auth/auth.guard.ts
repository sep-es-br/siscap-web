import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';

export const authGuard: CanActivateChildFn = (route, state) => {
  const router = inject(Router);
  const storageToken = sessionStorage.getItem('token');

  if (storageToken) {
    return true;
  }

  // Salva a URL que o usuário tentou acessar
  sessionStorage.setItem('redirectUrl', state.url);

  return router.createUrlTree(['/login']);
};
