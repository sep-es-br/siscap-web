import { inject } from '@angular/core';
import {
  CanActivateChildFn,
  CanActivateFn,
  Router,
  UrlSegment,
  UrlSegmentGroup,
  UrlTree,
} from '@angular/router';

export const authExternalUrlGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const isAuthenticated = !!sessionStorage.getItem('token');

  if (!isAuthenticated) {
    // Guarda a URL COMPLETA (incluindo parâmetros) no sessionStorage
    sessionStorage.setItem('externalRedirectUrl', state.url);
    return router.createUrlTree(['/login']); // Redireciona para o login
  }

  return true; // Permite o acesso se já estiver autenticado
};
