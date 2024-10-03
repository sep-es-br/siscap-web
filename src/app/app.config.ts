import { ApplicationConfig } from '@angular/core';
import {
  PreloadAllModules,
  TitleStrategy,
  provideRouter,
  withPreloading,
} from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { APP_ROUTES } from './app.routes';

import { SiscapTitleStrategy } from './core/utils/SiscapTitleStrategy';

import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorHandlerInterceptor } from './core/interceptors/error-handler.interceptor';

import { provideQuillConfig } from 'ngx-quill';
import { quillEditorToolbarOptions } from './core/utils/quill-editor-toolbar-options';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(APP_ROUTES, withPreloading(PreloadAllModules)),
    { provide: TitleStrategy, useClass: SiscapTitleStrategy },
    provideHttpClient(
      withInterceptors([authInterceptor, errorHandlerInterceptor])
    ),
    provideQuillConfig({
      modules: {
        toolbar: quillEditorToolbarOptions,
      },
      placeholder: '-- Insira o texto aqui --',
    }),
  ],
};
