import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ProjetosComponent } from './projetos.component';
import { ProjetoFormComponent } from './form/projeto-form.component';

import { projetos_NoIdEditarGuard } from '../../core/guards/projetos/no-id-editar.guard';

const PROJETOS_ROUTES: Routes = [
  {
    title: 'Projetos',
    path: '',
    component: ProjetosComponent,
  },
  {
    title: 'Cadastrar Projeto',
    path: 'criar',
    component: ProjetoFormComponent,
  },
  {
    title: 'Editar Projeto',
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
