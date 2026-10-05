import { MENSAGENS } from '../../core/utils/constants';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CartasConsultaComponent } from './cartas-consulta.component';
import { CartaConsultaFormComponent } from './form/carta-consulta-form.component';
import { CartaConsultaViewComponent } from './view/carta-consulta-view.component';

import { cartasConsulta_NoIdEditarGuard } from '../../core/guards/cartas-consulta/no-id-editar.guard';
import { cartasConsulta_NoIdVisualizarGuard } from '../../core/guards/cartas-consulta/no-id-visualizar.guard';

const CARTAS_CONSULTA_ROUTES: Routes = [
  {
    title: MENSAGENS.PESQUISA_DE_FONTES_DE_FINANCIAMENTO_1,
    path: '',
    component: CartasConsultaComponent,
  },
  {
    title: MENSAGENS.CADASTRAR_CARTA_CONSULTA,
    path: 'criar',
    component: CartaConsultaFormComponent,
  },
  {
    title: MENSAGENS.EDITAR_CARTA_CONSULTA,
    path: 'editar',
    component: CartaConsultaFormComponent,
    canActivate: [cartasConsulta_NoIdEditarGuard],
  },
  {
    title: MENSAGENS.VISUALIZAR_CARTA_CONSULTA,
    path: 'visualizar',
    component: CartaConsultaViewComponent,
    canActivate: [cartasConsulta_NoIdVisualizarGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(CARTAS_CONSULTA_ROUTES)],
  exports: [RouterModule],
})
export class CartasConsultaRoutingModule {}
