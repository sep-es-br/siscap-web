import { MENSAGENS } from '../../core/utils/constants';
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
    title: MENSAGENS.PESSOAS,
    path: '',
    component: PessoasComponent,
    canActivate: [isProponenteGuard],
  },
  {
    title: MENSAGENS.CADASTRAR_PESSOA,
    path: 'criar',
    component: PessoaFormComponent,
    canActivate: [isProponenteGuard],
  },
  {
    title: MENSAGENS.EDITAR_PESSOA,
    path: 'editar',
    component: PessoaFormComponent,
    canActivate: [pessoas_NoIdEditarGuard, isProponenteGuard],
  },
  {
    title: MENSAGENS.MEU_PERFIL,
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
