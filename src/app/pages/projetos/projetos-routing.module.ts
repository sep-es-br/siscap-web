import { MENSAGENS } from '../../core/utils/constants';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ProjetosComponent } from './projetos.component';
import { ProjetoFormComponent } from './form/projeto-form.component';

import { projetos_NoIdEditarGuard } from '../../core/guards/projetos/no-id-editar.guard';
import { authGuard } from '../../core/guards/auth/auth.guard';
import { authExternalUrlGuard } from '../../core/guards/auth/auth.externalUrl.guard';

const PROJETOS_ROUTES: Routes = [
  {
    title: MENSAGENS.PROJETOS,
    path: '',
    component: ProjetosComponent,
  },
  {
    title: MENSAGENS.CADASTRAR_PROJETO,
    path: 'criar',
    component: ProjetoFormComponent,
  },
  {
    title: MENSAGENS.EDITAR_DIC_VIA_LINK,
    path: 'editar/:id', 
    component: ProjetoFormComponent,
    canActivate: [authExternalUrlGuard]
  },
  {
    title: MENSAGENS.EDITAR_DIC,
    path: 'editar',
    component: ProjetoFormComponent,
    canActivate: [projetos_NoIdEditarGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(PROJETOS_ROUTES)],
  exports: [RouterModule],
})
export class ProjetosRoutingModule {}
