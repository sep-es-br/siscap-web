import { Pipe, PipeTransform } from '@angular/core';

enum breadCrumbTitles {
  main = 'Página Principal',

  projetos = 'Projetos',

  projetoscriar = 'Novo Projeto',
  projetoseditar = 'Editar Projeto',
  projetosdetalhes = 'Visualizar Projeto',

  pessoas = 'Pessoas',

  pessoascriar = 'Novo Usuário',
  pessoaseditar = 'Editar Pessoa',
  pessoasdetalhes = 'Visualizar Pessoa',

  entidades = 'Organizações',

  entidadescriar = 'Nova Organização',
  entidadeseditar = 'Editar Organização',
  entidadesdetalhes = 'Visualizar Organização',
}

@Pipe({
  name: 'breadcrumbnavlink',
  standalone: true,
})
export class BreadcrumbnavlinkPipe implements PipeTransform {
  transform(value: string, ...args: unknown[]): string {
    return breadCrumbTitles[value as keyof typeof breadCrumbTitles];
  }
}
