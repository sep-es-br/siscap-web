import { Pipe, PipeTransform } from '@angular/core';

const enum breadCrumbTitles {
  main = 'Home',
  projects = 'Projetos',
  projectscreate = 'Novo Projeto',
  projectsedit = 'Editar Projeto',
  projectsdetails = 'Visualizar Projeto',
}

@Pipe({
  name: 'breadcrumbnavlink',
  standalone: true,
})
export class BreadcrumbnavlinkPipe implements PipeTransform {
  transform(value: string, ...args: unknown[]): unknown {
    let transformedValue = '';

    switch (value) {
      case 'main':
        transformedValue = breadCrumbTitles.main;
        break;

      case 'projects':
        transformedValue = breadCrumbTitles.projects;
        break;

      case 'projectscreate':
        transformedValue = breadCrumbTitles.projectscreate;
        break;

      case 'projectsedit':
        transformedValue = breadCrumbTitles.projectsedit;
        break;

      case 'projectsdetails':
        transformedValue = breadCrumbTitles.projectsdetails;
        break;
        

      // Inserir demais casos:
      // case 'programs':
      //  transformedValue = 'Programas';
      //  break;

      default:
        break;
    }

    return transformedValue;
  }
}
