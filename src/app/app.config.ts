import { ApplicationConfig } from '@angular/core';
import { TitleStrategy, provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';

import { SiscapTitleStrategy } from './shared/utils/SiscapTitleStrategy';

import { errorHandlerInterceptor } from './shared/interceptors/error-handler.interceptor';
import { authInterceptor } from './shared/interceptors/auth.interceptor';


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    { provide: TitleStrategy, useClass: SiscapTitleStrategy },
    provideHttpClient(
      withInterceptors([authInterceptor, errorHandlerInterceptor])
    ),
  ],
};
