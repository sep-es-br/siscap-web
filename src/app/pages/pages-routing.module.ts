import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';

import { authGuard } from '../core/guards/auth/auth.guard';

const PAGES_ROUTES: Routes = [
  {
    title: 'Página Principal',
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'projetos',
    loadChildren: () =>
      import('./projetos/projetos.module').then((m) => m.ProjetosModule),
    canActivateChild: [authGuard],
  },
  {
    path: 'pessoas',
    loadChildren: () =>
      import('./pessoas/pessoas.module').then((m) => m.PessoasModule),
    canActivateChild: [authGuard],
  },
  {
    path: 'organizacoes',
    loadChildren: () =>
      import('./organizacoes/organizacoes.module').then(
        (m) => m.OrganizacoesModule
      ),
    canActivateChild: [authGuard],
  },
  {
    path: 'programas',
    loadChildren: () =>
      import('./programas/programas.module').then((m) => m.ProgramasModule),
    canActivateChild: [authGuard],
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];

@NgModule({
  imports: [RouterModule.forChild(PAGES_ROUTES)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
