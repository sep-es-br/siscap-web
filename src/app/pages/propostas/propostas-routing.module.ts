import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PropostasComponent } from './propostas.component';
import { PropostaFormComponent } from './form/proposta-form.component';

import { projetos_NoIdEditarGuard } from '../../core/guards/projetos/no-id-editar.guard';

import { breadcrumbBotoesAcao_ListResolver } from '../../core/resolvers/breadcrumb-botoesacao/list.resolver';
import { breadcrumbBotoesAcao_FormResolver } from '../../core/resolvers/breadcrumb-botoesacao/form.resolver';
import { breadcrumbBotoesAcao_PropostaFormResolver } from '../../core/resolvers/propostas/propostas.form.resolver';

const PROPOSTAS_ROUTES: Routes = [
  {
    title: 'Propostas',
    path: '',
    component: PropostasComponent,
    resolve: { botoesAcao: breadcrumbBotoesAcao_ListResolver },
  },
  {
    title: 'Cadastrar Proposta',
    path: 'criar',
    component: PropostaFormComponent,
    resolve: { botoesAcao: breadcrumbBotoesAcao_PropostaFormResolver },
  },
  {
    title: 'Editar Proposta',
    path: 'editar',
    component: PropostaFormComponent,
    canActivate: [projetos_NoIdEditarGuard],
    resolve: { botoesAcao: breadcrumbBotoesAcao_FormResolver },
  },
];

@NgModule({
  imports: [RouterModule.forChild(PROPOSTAS_ROUTES)],
  exports: [RouterModule],
})
export class PropostasRoutingModule {}
