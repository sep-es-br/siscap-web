import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { TitleStrategy, provideRouter } from '@angular/router';
import {
  HttpClientModule,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';

import { routes } from './app.routes';

import { authInterceptor } from './shared/interceptors/auth.interceptor';
import { SiscapTitleStrategy } from './shared/utils/SiscapTitleStrategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    { provide: TitleStrategy, useClass: SiscapTitleStrategy },
    importProvidersFrom(HttpClientModule),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};
