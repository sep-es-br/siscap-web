import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CartasConsultaComponent } from './cartas-consulta.component';
import { CartaConsultaFormComponent } from './form/carta-consulta-form.component';
import { CartaConsultaViewComponent } from './view/carta-consulta-view.component';

import { cartasConsulta_NoIdEditarGuard } from '../../core/guards/cartas-consulta/no-id-editar.guard';

import { breadcrumbBotoesAcao_ListResolver } from '../../core/resolvers/breadcrumb-botoesacao/list.resolver';
import { breadcrumbBotoesAcao_FormResolver } from '../../core/resolvers/breadcrumb-botoesacao/form.resolver';
import { cartasConsulta_NoIdVisualizarGuard } from '../../core/guards/cartas-consulta/no-id-visualizar.guard';

const CARTAS_CONSULTA_ROUTES: Routes = [
  {
    title: 'Cartas Consulta',
    path: '',
    component: CartasConsultaComponent,
    resolve: { botoesAcao: breadcrumbBotoesAcao_ListResolver },
  },
  {
    title: 'Cadastrar Carta Consulta',
    path: 'criar',
    component: CartaConsultaFormComponent,
    resolve: { botoesAcao: breadcrumbBotoesAcao_FormResolver },
  },
  {
    title: 'Editar Carta Consulta',
    path: 'editar',
    component: CartaConsultaFormComponent,
    canActivate: [cartasConsulta_NoIdEditarGuard],
    resolve: { botoesAcao: breadcrumbBotoesAcao_FormResolver },
  },
  {
    title: 'Visualizar Carta Consulta',
    path: 'visualizar',
    component: CartaConsultaViewComponent,
    canActivate: [cartasConsulta_NoIdVisualizarGuard],
    data: {
      botoesAcao: {
        botoes: ['editar'],
        contexto: 'cartasconsulta',
      },
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(CARTAS_CONSULTA_ROUTES)],
  exports: [RouterModule],
})
export class CartasConsultaRoutingModule {}
