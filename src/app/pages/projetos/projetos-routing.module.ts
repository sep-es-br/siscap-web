import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ProjetosComponent } from './projetos.component';
import { ProjetoFormComponent } from './form/projeto-form.component';

import { projetos_NoIdEditarGuard } from '../../core/guards/projetos/no-id-editar.guard';

import { breadcrumbBotoesAcao_ListResolver } from '../../core/resolvers/breadcrumb-botoesacao/list.resolver';
import { breadcrumbBotoesAcao_FormResolver } from '../../core/resolvers/breadcrumb-botoesacao/form.resolver';
import { breadcrumbBotoesAcao_ProjetoFormResolver } from '../../core/resolvers/projetos/projetos-form.resolver';

const PROJETOS_ROUTES: Routes = [
  {
    title: 'Projetos',
    path: '',
    component: ProjetosComponent,
    resolve: { botoesAcao: breadcrumbBotoesAcao_ListResolver },
  },
  {
    title: 'Cadastrar Projeto',
    path: 'criar',
    component: ProjetoFormComponent,
    resolve: { botoesAcao: breadcrumbBotoesAcao_ProjetoFormResolver },
  },
  {
    title: 'Editar Projeto',
    path: 'editar',
    component: ProjetoFormComponent,
    canActivate: [projetos_NoIdEditarGuard],
    resolve: { botoesAcao: breadcrumbBotoesAcao_ProjetoFormResolver },
  },
];

@NgModule({
  imports: [RouterModule.forChild(PROJETOS_ROUTES)],
  exports: [RouterModule],
})
export class ProjetosRoutingModule {}
