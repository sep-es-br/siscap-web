import { Routes } from '@angular/router';

import { LoginComponent } from './pages/login/login.component';
import { MainComponent } from './pages/main/main.component';
import { AuthRedirectComponent } from './pages/auth-redirect/auth-redirect.component';
import { authGuard } from './shared/guards/auth.guard';


export const routes: Routes = [
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
    path: '**',
    redirectTo: 'main',
  },
];
