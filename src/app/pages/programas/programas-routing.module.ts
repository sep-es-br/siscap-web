import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ProgramasComponent } from './programas.component';
import { ProgramaFormComponent } from './form/programa-form.component';

import { programas_NoIdEditarGuard } from '../../core/guards/programas/no-id-editar.guard';
import { ProgramaAssinaturasComponent } from './assinaturas/programa-assinaturas.component';
import { isProponenteGuard } from '../../core/guards/is-proponente/is-proponente.guard';

const PROGRAMAS_ROUTES: Routes = [
  {
    title: 'Programas',
    path: '',
    component: ProgramasComponent,
    canActivate: [isProponenteGuard],
  },
  {
    title: 'Cadastrar Programa',
    path: 'criar',
    component: ProgramaFormComponent,
    canActivate: [isProponenteGuard],
  },
  {
    title: 'Editar Programa',
    path: 'editar',
    component: ProgramaFormComponent,
    canActivate: [programas_NoIdEditarGuard, isProponenteGuard],
  },
  {
    title: 'Autorizações Programa',
    path: ':id/assinaturas',
    component: ProgramaAssinaturasComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(PROGRAMAS_ROUTES)],
  exports: [RouterModule],
})
export class ProgramasRoutingModule {}
