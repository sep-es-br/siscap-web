import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { OrganizacoesComponent } from './organizacoes.component';
import { OrganizacaoFormComponent } from './form/organizacao-form.component';

import { organizacoes_NoIdEditarGuard } from '../../core/guards/organizacoes/no-id-editar.guard';

const ORGANIZACOES_ROUTES: Routes = [
  {
    title: 'Organizações',
    path: '',
    component: OrganizacoesComponent,
  },
  {
    title: 'Cadastrar Organização',
    path: 'criar',
    component: OrganizacaoFormComponent,
  },
  {
    title: 'Editar Organização',
    path: 'editar',
    component: OrganizacaoFormComponent,
    canActivate: [organizacoes_NoIdEditarGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(ORGANIZACOES_ROUTES)],
  exports: [RouterModule],
})
export class OrganizacoesRoutingModule {}
