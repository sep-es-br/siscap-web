import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ProspeccoesComponent } from './prospeccoes.component';
import { ProspeccaoFormComponent } from './form/prospeccao-form.component';
import { ProspeccaoViewComponent } from './view/prospeccao-view.component';

import { prospeccoes_NoIdEditarGuard } from '../../core/guards/prospeccoes/no-id-editar.guard';

import { breadcrumbBotoesAcao_ListResolver } from '../../core/resolvers/breadcrumb-botoesacao/list.resolver';
import { breadcrumbBotoesAcao_FormResolver } from '../../core/resolvers/breadcrumb-botoesacao/form.resolver';
import { prospeccoes_NoIdVisualizarGuard } from '../../core/guards/prospeccoes/no-id-visualizar.guard';

const PROSPECCOES_ROUTES: Routes = [
  {
    title: 'Prospecção',
    path: '',
    component: ProspeccoesComponent,
    resolve: { botoesAcao: breadcrumbBotoesAcao_ListResolver },
  },
  {
    title: 'Cadastrar Prospecção',
    path: 'criar',
    component: ProspeccaoFormComponent,
    resolve: { botoesAcao: breadcrumbBotoesAcao_FormResolver },
  },
  {
    title: 'Editar Prospecção',
    path: 'editar',
    component: ProspeccaoFormComponent,
    canActivate: [prospeccoes_NoIdEditarGuard],
    resolve: { botoesAcao: breadcrumbBotoesAcao_FormResolver },
  },
  {
    title: 'Visualizar Prospecção',
    path: 'visualizar',
    component: ProspeccaoViewComponent,
    canActivate: [prospeccoes_NoIdVisualizarGuard],
    data: {
      botoesAcao: {
        botoes: ['editar', 'prospectar'],
        contexto: 'prospeccao',
      },
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(PROSPECCOES_ROUTES)],
  exports: [RouterModule],
})
export class ProspeccoesRoutingModule {}
