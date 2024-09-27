import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { OrganizacoesComponent } from './organizacoes.component';
import { OrganizacaoFormComponent } from './form/organizacao-form.component';

import { organizacoes_NoIdEditarGuard } from '../../core/guards/organizacoes/no-id-editar.guard';

import { breadcrumbBotoesAcao_ListResolver } from '../../core/resolvers/breadcrumb-botoesacao/list.resolver';
import { breadcrumbBotoesAcao_FormResolver } from '../../core/resolvers/breadcrumb-botoesacao/form.resolver';

const ORGANIZACOES_ROUTES: Routes = [
  {
    title: 'Organizações',
    path: '',
    component: OrganizacoesComponent,
    resolve: { botoesAcao: breadcrumbBotoesAcao_ListResolver },
  },
  {
    title: 'Cadastrar Organização',
    path: 'criar',
    component: OrganizacaoFormComponent,
    resolve: { botoesAcao: breadcrumbBotoesAcao_FormResolver },
  },
  {
    title: 'Editar Organização',
    path: 'editar',
    component: OrganizacaoFormComponent,
    canActivate: [organizacoes_NoIdEditarGuard],
    resolve: { botoesAcao: breadcrumbBotoesAcao_FormResolver },
  },
];

@NgModule({
  imports: [RouterModule.forChild(ORGANIZACOES_ROUTES)],
  exports: [RouterModule],
})
export class OrganizacoesRoutingModule {}
