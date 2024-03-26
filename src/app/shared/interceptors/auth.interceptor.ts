import { HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError } from 'rxjs';
import { SiscapErrorHandler } from '../handlers/error-handler';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = new Router()

  const reqClone = req.clone({
    headers: req.headers.set(
      'Authorization',
      `Bearer ${sessionStorage.getItem('token')}`
    ),
  });

  return next(reqClone).pipe(
    catchError((err) => {
      new SiscapErrorHandler(err, router).handleError()
      throw new Error('Ocorreu um erro ao processar a requisição. Erro: ' + err.status) 
    })
  );
};
