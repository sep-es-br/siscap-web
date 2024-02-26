import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'breadcrumbnavlink',
  standalone: true,
})
export class BreadcrumbnavlinkPipe implements PipeTransform {
  transform(value: string, ...args: unknown[]): unknown {
    if (value.includes('?')) {
      value = value.slice(0, value.indexOf('?') + 1);
    }
    
    let transformedValue = '';

    switch (value) {
      case 'home':
        transformedValue = 'Home';
        break;
      case 'projects':
        transformedValue = 'Projetos';
        break;
      case 'create':
        transformedValue = 'Novo Projeto';
        break;
      case 'create?':
        transformedValue = 'Editar Projeto';
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
