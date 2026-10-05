import { MENSAGENS } from '../../core/utils/constants';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { OrganizacoesComponent } from './organizacoes.component';
import { OrganizacaoFormComponent } from './form/organizacao-form.component';

import { organizacoes_NoIdEditarGuard } from '../../core/guards/organizacoes/no-id-editar.guard';

const ORGANIZACOES_ROUTES: Routes = [
  {
    title: MENSAGENS.ORGANIZACOES,
    path: '',
    component: OrganizacoesComponent,
  },
  {
    title: MENSAGENS.CADASTRAR_ORGANIZACAO,
    path: 'criar',
    component: OrganizacaoFormComponent,
  },
  {
    title: MENSAGENS.EDITAR_ORGANIZACAO,
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
