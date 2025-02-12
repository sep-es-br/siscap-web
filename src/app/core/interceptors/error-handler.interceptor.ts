import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';

import { catchError, tap } from 'rxjs';

import { ErrorHandlerService } from '../services/error-handler/error-handler.service';

export const errorHandlerInterceptor: HttpInterceptorFn = (req, next) => {
  const errorHandlerService = inject(ErrorHandlerService);

  const reqCloneResponseTypeJson = req.clone({
    responseType: 'json',
  });

  const handleResponseError = next(reqCloneResponseTypeJson).pipe(
    tap({
      error: (error: HttpErrorResponse) =>
        errorHandlerService.handleError(error),
    })
  );

  return next(req).pipe(catchError(() => handleResponseError));
};

/*
  - ABORDAGEM errorHandlerInterceptor SEM CHAMAR REQUISICAO DUAS VEZES -
  - TESTAR ISSO MAIS TARDE -

export const errorHandlerInterceptor: HttpHandlerFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const errorHandlerService = inject(ErrorHandlerService);

  return next(req).pipe(
    map((event) => {
      if (event instanceof HttpResponse && event.body instanceof ArrayBuffer) {
        return event;
      }
      return event;
    }),
    catchError((error: HttpErrorResponse) => {
      if (error.error instanceof ArrayBuffer) {
        const decodedString = String.fromCharCode.apply(
          null,
          new Uint8Array(error.error)
        );
        try {
          const jsonError = JSON.parse(decodedString);
          const updatedError = new HttpErrorResponse({
            error: jsonError,
            headers: error.headers,
            status: error.status,
            statusText: error.statusText,
            url: error.url || undefined,
          });
          errorHandlerService.handleError(updatedError);
          return throwError(() => updatedError);
        } catch (e) {
          errorHandlerService.handleError(error);
          return throwError(() => error);
        }
      }
      errorHandlerService.handleError(error);
      return throwError(() => error);
    })
  );
};

*/