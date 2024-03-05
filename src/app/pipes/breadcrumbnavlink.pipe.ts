import { Pipe, PipeTransform } from '@angular/core';

enum breadCrumbTitles {
  main = 'Home',

  projetos = 'Projetos',

  projetoscriar = 'Novo Projeto',
  projetoseditar = 'Editar Projeto',
  projetosdetalhes = 'Visualizar Projeto',

  pessoas = 'Pessoas',

  pessoascriar = 'Nova Pessoa',
  pessoaseditar = 'Editar Pessoa',
  pessoasdetalhes = 'Visualizar Pessoa',
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
