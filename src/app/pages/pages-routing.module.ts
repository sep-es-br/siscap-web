import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { ProjectsComponent } from './projects/projects.component';
import { CreateComponent } from './projects/create/create.component';

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
    title: 'Novo Projeto',
    path: 'projects/create',
    component: CreateComponent,
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
