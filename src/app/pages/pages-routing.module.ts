import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { ProjectsComponent } from './projects/projects.component';
import { ProjectFormComponent } from './projects/form/project-form.component';
import { PersonsComponent } from './persons/persons.component';
import { PersonFormComponent } from './persons/form/person-form.component';
import { OrganizationsComponent } from './organizations/organizations.component';
import { OrganizationFormComponent } from './organizations/form/organization-form.component';
import { ProgramasComponent } from './programas/programas.component';
import { ProgramaFormComponent } from './programas/form/programa-form.component';
import { OrganizacoesFormComponent } from './organizacoes/form/organizacoes-form.component';
import { OrganizacoesListComponent } from './organizacoes/list/organizacoes-list.component';

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
    title: 'Organizacoes',
    path: 'organizacoes',
    // component: OrganizationsComponent,
    component: OrganizacoesListComponent,
  },
  {
    title: 'Formulário de Organizacao',
    path: 'organizacoes/form/:mode',
    // component: OrganizationFormComponent,
    component: OrganizacoesFormComponent,
  },
  {
    title: 'Programas',
    path: 'programas',
    component: ProgramasComponent,
  },
  {
    title: 'Formulário de Programa',
    path: 'programas/form/:mode',
    component: ProgramaFormComponent,
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
