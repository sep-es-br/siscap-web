import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { ProjectsComponent } from './projects/projects.component';
import { ProjectFormComponent } from './projects/form/project-form.component';

const routes: Routes = [
  {
    title: 'Home',
    path: 'home',
    component: HomeComponent,
  },
  {
    title: 'Projetos',
    path: 'projects',
    component: ProjectsComponent,
  },
  {
    title: 'Formulário de Projeto',
    path: 'projects/form/:mode',
    component: ProjectFormComponent,
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
