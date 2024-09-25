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
