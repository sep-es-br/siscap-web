import { Component } from '@angular/core';
import { EventType, NavigationEnd, Router } from '@angular/router';

import { filter } from 'rxjs';
import { BreadcrumbLists } from '../../../shared/utils/breadcrumb-lists';
import { ProfileService } from '../../../shared/services/profile/profile.service';

@Component({
  selector: 'siscap-breadcrumb',
  standalone: false,
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss',
})
export class BreadcrumbComponent {
  public exclusionList: Array<string> = BreadcrumbLists.exclusionList; // Lista de caminhos á serem ignorados (ex.: 'main' e 'form' redirecionam para 'home')
  public mainChildPaths: Array<string> = BreadcrumbLists.mainChildPaths; // Lista de caminhos "principais" da aplicação (ex.: 'projects', 'programs', etc.)

  public breadcrumbNav: Array<string> = []; // Rotas do breadcrumb atual
  public currentPage: string = ''; // Página atual (última rota do breadcrumbNav)

  constructor(
    private _profileService: ProfileService,
    private _router: Router
  ) {
    this._router.events
      .pipe(
        // Workaround para tipar Event_2 como NavigationEnd
        filter((event): event is NavigationEnd => {
          return event.type == EventType.NavigationEnd;
        })
      )
      .subscribe((next) => {
        const urlPaths = this.getUrlPaths(next['urlAfterRedirects']);
        const treatedUrlPaths = this.treatUrlPaths(urlPaths);

        this.breadcrumbNav = treatedUrlPaths;
        this.currentPage = this.breadcrumbNav.at(
          this.breadcrumbNav.length - 1
        )!;
      });
  }

  /**
   * Transforma a URL em um array de strings.
   *
   * O método `value.map()` retorna o caminho da URL removendo os queryParams (caractere '?') se existirem.
   *
   * O método `value.filter()` remove os caminhos contidos na lista de exclusão.
   *
   * @param value - A URL em formato de string.
   * @returns Um array de strings contendo os caminhos da URL.
   */
  private getUrlPaths(value: string): string[] {
    return value
      .split('/')
      .map((path) => {
        return path.includes('?') ? path.substring(0, path.indexOf('?')) : path;
      })
      .filter((path) => !this.exclusionList.includes(path));
  }

  /**
   * Trata o array dos caminhos da URL para utilizar no pipe do breadcrumb.
   *
   * O modo do fomulario (ex: 'create') é concatenado com o caminho anterior, á fim de alimentar o pipe de breadcrumb.
   *
   *
   * @example
   * ```ts
   * value = ['main', 'projects', 'create'] // 'create' está atrelado á 'projects' ('form' foi filtrado)
   * const treatedUrlPaths = this.treatUrlPaths(value) // resultado: ['main', 'projects', 'projectscreate']
   *
   * // Dentro do breadcrumbnavlinkPipe
   * ...
   * switch(value) {
   * ...
   *  case 'projects':
   *    transformedValue = 'Projetos'
   *    break;
   *
   *  // Errado: 'create' pode ter sido utilizado como o modo do formulário de outra página como 'programs'
   *  case 'create':
   *    transformedValue = 'Novo Projeto'
   *    break;
   *
   *  case 'create':
   *    transformedValue = 'Novo Programa'
   *    break;
   *
   *  // Correto: O valor transformado é retornado de acordo com a página que form/create foi chamado
   *  case 'projectscreate':
   *    transformedValue = 'Novo Projeto'
   *    break;
   *
   *  case 'programscreate':
   *    transformedValue = 'Novo Programa'
   *    break;
   * }
   * ...
   *
   * ```
   *
   * @param value - O array de strings contendo os caminhos da URL.
   * @returns O array de strings contendo os caminhos da URL tratados para alimentar o `breadcrumbnavlinkPipe`.
   */
  private treatUrlPaths(value: string[]): string[] {
    const formModes = ['criar', 'editar', 'detalhes'];
    return value.map((path) => {
      const previousPath = value.at(value.indexOf(path) - 1) ?? path;
      return formModes.includes(path)
        ? this.mainChildPaths.includes(previousPath)
          ? previousPath.concat(path)
          : path
        : path;
    });
  }

  public isAllowed(path: string): boolean {
    return this._profileService.isAllowed(path + 'criar');
  }

  /**
   * Volta para a pagina anterior.
   */
  public goBack() {
    history.back();
  }

  /**
   * Avança para a próxima página.
   */
  public goForward() {
    history.forward();
  }
}
