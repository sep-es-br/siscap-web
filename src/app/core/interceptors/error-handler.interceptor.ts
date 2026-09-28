import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, from, switchMap, throwError } from 'rxjs';

import { ErrorHandlerService } from '../services/error-handler/error-handler.service';

export const errorHandlerInterceptor: HttpInterceptorFn = (req, next) => {
  const errorHandlerService = inject(ErrorHandlerService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.error instanceof Blob && error.error.type.includes('json')) {
        return from(error.error.text()).pipe(
          switchMap((body) => {
            let parsedBody: unknown = body;
            try {
              parsedBody = JSON.parse(body);
            } catch {
              // Mantém a resposta original caso o corpo não seja JSON válido.
            }
            const parsedError = new HttpErrorResponse({
              error: parsedBody,
              headers: error.headers,
              status: error.status,
              statusText: error.statusText,
              url: error.url ?? undefined,
            });
            errorHandlerService.handleError(parsedError);
            return throwError(() => parsedError);
          })
        );
      }

      errorHandlerService.handleError(error);
      return throwError(() => error);
    })
  );
};
