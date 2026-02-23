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
    sessionStorage.setItem('redirectUrl', state.url);
    return router.createUrlTree(['/login']); // Redireciona para o login
  }

  return true; 
};
