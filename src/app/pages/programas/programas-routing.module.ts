import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ProgramasComponent } from './programas.component';
import { ProgramaFormComponent } from './form/programa-form.component';

import { programas_NoIdEditarGuard } from '../../core/guards/programas/no-id-editar.guard';

const PROGRAMAS_ROUTES: Routes = [
  {
    title: 'Programas',
    path: '',
    component: ProgramasComponent,
  },
  {
    title: 'Cadastrar Programa',
    path: 'criar',
    component: ProgramaFormComponent,
  },
  {
    title: 'Editar Programa',
    path: 'editar',
    component: ProgramaFormComponent,
    canActivate: [programas_NoIdEditarGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(PROGRAMAS_ROUTES)],
  exports: [RouterModule],
})
export class ProgramasRoutingModule {}
