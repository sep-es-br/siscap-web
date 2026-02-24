import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PessoasComponent } from './pessoas.component';
import { PessoaFormComponent } from './form/pessoa-form.component';
import { MeuPerfilComponent } from './meu-perfil/meu-perfil.component';

import { pessoas_NoIdEditarGuard } from '../../core/guards/pessoas/no-id-editar.guard';
import { pessoas_NoSubNovoMeuPerfilGuard } from '../../core/guards/pessoas/no-sub-novo-meu-perfil.guard';
import { isProponenteGuard } from '../../core/guards/is-proponente/is-proponente.guard';

const PESSOAS_ROUTES: Routes = [
  {
    title: 'Pessoas',
    path: '',
    component: PessoasComponent,
    canActivate: [isProponenteGuard],
  },
  {
    title: 'Cadastrar Pessoa',
    path: 'criar',
    component: PessoaFormComponent,
    canActivate: [isProponenteGuard],
  },
  {
    title: 'Editar Pessoa',
    path: 'editar',
    component: PessoaFormComponent,
    canActivate: [pessoas_NoIdEditarGuard, isProponenteGuard],
  },
  {
    title: 'Meu Perfil',
    path: 'meu-perfil',
    component: MeuPerfilComponent,
    canActivate: [pessoas_NoSubNovoMeuPerfilGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(PESSOAS_ROUTES)],
  exports: [RouterModule],
})
export class PessoasRoutingModule {}
