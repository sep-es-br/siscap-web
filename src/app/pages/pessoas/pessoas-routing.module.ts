import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PessoasComponent } from './pessoas.component';
import { PessoaFormComponent } from './form/pessoa-form.component';
import { MeuPerfilComponent } from './meu-perfil/meu-perfil.component';

import { pessoas_NoIdEditarGuard } from '../../core/guards/pessoas/no-id-editar.guard';
import { pessoas_NoSubNovoMeuPerfilGuard } from '../../core/guards/pessoas/no-sub-novo-meu-perfil.guard';

import { breadcrumbBotoesAcao_ListResolver } from '../../core/resolvers/breadcrumb-botoesacao/list.resolver';
import { breadcrumbBotoesAcao_FormResolver } from '../../core/resolvers/breadcrumb-botoesacao/form.resolver';

const PESSOAS_ROUTES: Routes = [
  {
    title: 'Pessoas',
    path: '',
    component: PessoasComponent,
    resolve: { botoesAcao: breadcrumbBotoesAcao_ListResolver },
  },
  {
    title: 'Cadastrar Pessoa',
    path: 'criar',
    component: PessoaFormComponent,
    resolve: { botoesAcao: breadcrumbBotoesAcao_FormResolver },
  },
  {
    title: 'Editar Pessoa',
    path: 'editar',
    component: PessoaFormComponent,
    canActivate: [pessoas_NoIdEditarGuard],
    resolve: { botoesAcao: breadcrumbBotoesAcao_FormResolver },
  },
  // Override de breadcrumbBotoesAcao_FormResolver
  // Propriedades do breadcrumb são definidas diretamente na propriedade data da rota
  {
    title: 'Meu Perfil',
    path: 'meu-perfil',
    component: MeuPerfilComponent,
    canActivate: [pessoas_NoSubNovoMeuPerfilGuard],
    data: {
      botoesAcao: {
        botoes: ['editar'],
        contexto: 'pessoas',
      },
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(PESSOAS_ROUTES)],
  exports: [RouterModule],
})
export class PessoasRoutingModule {}
