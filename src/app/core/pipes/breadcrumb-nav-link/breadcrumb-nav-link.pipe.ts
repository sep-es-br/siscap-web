import { Pipe, PipeTransform } from '@angular/core';

enum breadCrumbTitles {
  main = 'Página Principal',

  projetos = 'Projetos',

  projetoscriar = 'Novo Projeto',
  projetoseditar = 'Editar Projeto',

  programas = 'Programas',

  programascriar = 'Novo Programa',
  programaseditar = 'Editar Programa',

  pessoas = 'Pessoas',

  pessoascriar = 'Novo Usuário',
  pessoaseditar = 'Editar Pessoa',

  organizacoes = 'Organizações',

  organizacoescriar = 'Nova Organização',
  organizacoeseditar = 'Editar Organização',
}

@Pipe({
  name: 'breadcrumbnavlink',
  standalone: true,
})
export class BreadcrumbNavLinkPipe implements PipeTransform {
  transform(value: string, ...args: unknown[]): string {
    return breadCrumbTitles[value as keyof typeof breadCrumbTitles];
  }
}
