import { Routes } from '@angular/router';

import { LoginComponent } from './pages/login/login.component';
import { AuthRedirectComponent } from './pages/auth-redirect/auth-redirect.component';
import { MainComponent } from './pages/main/main.component';

import { authGuard } from './core/guards/auth/auth.guard';
import { authExternalUrlGuard } from './core/guards/auth/auth.externalUrl.guard';
import { ProjetoFormComponent } from './pages/projetos/form/projeto-form.component';
import { ProgramaAssinaturasComponent } from './pages/programas/assinaturas/programa-assinaturas.component';

export const APP_ROUTES: Routes = [
  {
    title: 'Login',
    path: 'login',
    component: LoginComponent,
  },
  {
    title: 'Autorizando...',
    path: 'token',
    component: AuthRedirectComponent,
  },
  {
    path: 'main',
    component: MainComponent,
    loadChildren: () =>
      import('./pages/pages.module').then((m) => m.PagesModule),
    canActivateChild: [authGuard],
  },
  {
    path: 'projetos/editar/:id',  // :id é um parâmetro dinâmico
    component: ProjetoFormComponent,  // Ou carrega um módulo
    canActivateChild: [authExternalUrlGuard],
  },
  {
    path: 'projetos/parecer/:id',
    component: ProjetoFormComponent,
    canActivateChild: [authExternalUrlGuard],
  },
  {
    path: 'main/programas/:id/assinaturas',
    component: ProgramaAssinaturasComponent,
  },
  {
    path: '**',
    redirectTo: 'main',
  },
];
