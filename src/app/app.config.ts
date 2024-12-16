import { ApplicationConfig } from '@angular/core';
import {
  PreloadAllModules,
  RouteReuseStrategy,
  TitleStrategy,
  provideRouter,
  withPreloading,
  withRouterConfig,
} from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import {
  NgbDateAdapter,
  NgbDateParserFormatter,
  NgbDatepickerI18n,
} from '@ng-bootstrap/ng-bootstrap';

import { APP_ROUTES } from './app.routes';

import { SiscapTitleStrategy } from './core/providers/angular/SiscapTitleStrategy';
import { SiscapRouteReuseStrategy } from './core/providers/angular/SiscapRouteReuseStrategy';

import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorHandlerInterceptor } from './core/interceptors/error-handler.interceptor';

import { provideQuillConfig } from 'ngx-quill';
import { quillEditorToolbarOptions } from './core/utils/quill-editor-toolbar-options';

import { SiscapNgbDateParserFormatter } from './core/providers/ng-bootstrap/SiscapNgbDateParserFormatter';
import { SiscapNgbDateAdapter } from './core/providers/ng-bootstrap/SiscapNgbDateAdapter';
import { SiscapNgbDatepickerI18n } from './core/providers/ng-bootstrap/SiscapNgbDatepickerI18n';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      APP_ROUTES,
      withRouterConfig({ onSameUrlNavigation: 'reload' }),
      withPreloading(PreloadAllModules)
    ),
    provideHttpClient(
      withInterceptors([authInterceptor, errorHandlerInterceptor])
    ),
    provideQuillConfig({
      modules: {
        toolbar: quillEditorToolbarOptions,
      },
      placeholder: '-- Insira o texto aqui --',
    }),
    { provide: TitleStrategy, useClass: SiscapTitleStrategy },
    { provide: RouteReuseStrategy, useClass: SiscapRouteReuseStrategy },
    { provide: NgbDateParserFormatter, useClass: SiscapNgbDateParserFormatter },
    { provide: NgbDateAdapter, useClass: SiscapNgbDateAdapter },
    { provide: NgbDatepickerI18n, useClass: SiscapNgbDatepickerI18n },
  ],
};
