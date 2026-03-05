import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';

export const authGuard: CanActivateChildFn = (route, state) => {
  const router = inject(Router);
  const storageToken = sessionStorage.getItem('token');

  if (storageToken) {
    localStorage.removeItem('redirectUrl');
    return true;
  }

  localStorage.setItem('redirectUrl', state.url);

  return router.createUrlTree(['/login']);
};