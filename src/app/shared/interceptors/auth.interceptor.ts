import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const reqCloneSetAuthToken = req.clone({
    headers: req.headers.set(
      'Authorization',
      `Bearer ${sessionStorage.getItem('token')}`
    ),
  });

  return next(reqCloneSetAuthToken);
};
