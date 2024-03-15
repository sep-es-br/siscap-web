import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { ProjectsComponent } from './projects/projects.component';
import { ProjectFormComponent } from './projects/form/project-form.component';
import { PersonsComponent } from './persons/persons.component';
import { PersonFormComponent } from './persons/form/person-form.component';
import { EntitiesComponent } from './entities/entities.component';
import { EntityFormComponent } from './entities/form/entity-form.component';

const routes: Routes = [
  {
    title: 'Página Principal',
    path: 'home',
    component: HomeComponent,
  },
  {
    title: 'Projetos',
    path: 'projetos',
    component: ProjectsComponent,
  },
  {
    title: 'Formulário de Projeto',
    path: 'projetos/form/:mode',
    component: ProjectFormComponent,
  },
  {
    title: 'Pessoas',
    path: 'pessoas',
    component: PersonsComponent,
  },
  {
    title: 'Formulário de Pessoa',
    path: 'pessoas/form/:mode',
    component: PersonFormComponent,
  },
  {
    title: 'Entidades',
    path: 'entidades',
    component: EntitiesComponent,
  },
  {
    title: 'Formulário de Entidade',
    path: 'entidades/form/:mode',
    component: EntityFormComponent,
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
