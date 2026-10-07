import { MENSAGENS } from '../../core/utils/constants';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ProgramasComponent } from './programas.component';
import { ProgramaFormComponent } from './form/programa-form.component';

import { programas_NoIdEditarGuard } from '../../core/guards/programas/no-id-editar.guard';
import { ProgramaAssinaturasComponent } from './assinaturas/programa-assinaturas.component';
import { isProponenteGuard } from '../../core/guards/is-proponente/is-proponente.guard';

const PROGRAMAS_ROUTES: Routes = [
  {
    title: MENSAGENS.PROGRAMAS,
    path: '',
    component: ProgramasComponent,
    canActivate: [isProponenteGuard],
  },
  {
    title: MENSAGENS.CADASTRAR_PROGRAMA,
    path: 'criar',
    component: ProgramaFormComponent,
    canActivate: [isProponenteGuard],
  },
  {
    title: MENSAGENS.EDITAR_PROGRAMA,
    path: 'editar/:id',
    component: ProgramaFormComponent,
    canActivate: [programas_NoIdEditarGuard, isProponenteGuard],
  },
  {
    title: MENSAGENS.EDITAR_PROGRAMA,
    path: 'editar',
    component: ProgramaFormComponent,
    canActivate: [programas_NoIdEditarGuard, isProponenteGuard],
  },
  {
    title: MENSAGENS.AUTORIZACOES_PROGRAMA,
    path: ':id/assinaturas',
    component: ProgramaAssinaturasComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(PROGRAMAS_ROUTES)],
  exports: [RouterModule],
})
export class ProgramasRoutingModule {}
