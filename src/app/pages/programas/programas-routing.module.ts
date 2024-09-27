import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ProgramasComponent } from './programas.component';
import { ProgramaFormComponent } from './form/programa-form.component';

import { programas_NoIdEditarGuard } from '../../core/guards/programas/no-id-editar.guard';

import { breadcrumbBotoesAcao_ListResolver } from '../../core/resolvers/breadcrumb-botoesacao/list.resolver';
import { breadcrumbBotoesAcao_FormResolver } from '../../core/resolvers/breadcrumb-botoesacao/form.resolver';

const PROGRAMAS_ROUTES: Routes = [
  {
    title: 'Programas',
    path: '',
    component: ProgramasComponent,
    resolve: { botoesAcao: breadcrumbBotoesAcao_ListResolver },
  },
  {
    title: 'Cadastrar Programa',
    path: 'criar',
    component: ProgramaFormComponent,
    resolve: { botoesAcao: breadcrumbBotoesAcao_FormResolver },
  },
  {
    title: 'Editar Programa',
    path: 'editar',
    component: ProgramaFormComponent,
    canActivate: [programas_NoIdEditarGuard],
    resolve: { botoesAcao: breadcrumbBotoesAcao_FormResolver },
  },
];

@NgModule({
  imports: [RouterModule.forChild(PROGRAMAS_ROUTES)],
  exports: [RouterModule],
})
export class ProgramasRoutingModule {}
