import {Component} from '@angular/core';
import {EventType, NavigationEnd, Router} from '@angular/router';

import {filter} from 'rxjs';
import {BreadcrumbLists} from '../../../shared/utils/breadcrumb-lists';
import {BreadcrumbService} from '../../../shared/services/breadcrumb/breadcrumb.service';
import {ProfileService} from '../../../shared/services/profile/profile.service';
import {PermissionsMap} from "../../../shared/interfaces/profile.interface";

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
  protected untratedUrls: Array<string> = []; // URL atual
  public showEditButton: boolean = false;
  public showCancelButton: boolean = false;
  public showSaveButton: boolean = false;

  constructor(
    private _profileService: ProfileService,
    private _router: Router,
    private breadcrumbService: BreadcrumbService
  ) {
    this._router.events
      .pipe(
        // Workaround para tipar Event_2 como NavigationEnd
        filter((event): event is NavigationEnd => {
          return event.type == EventType.NavigationEnd;
        })
      )
      .subscribe((next) => {
        this.untratedUrls = this.getUntratedUrls(next['urlAfterRedirects']);
        this.checkActionButtons();
        const urlPaths = this.getUrlPaths(next['urlAfterRedirects']);
        this.breadcrumbNav = this.treatUrlPaths(urlPaths);
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
   * Emite a ação do breadcrumb.
   *
   * @param action - A ação do breadcrumb.
   */

  breadcrumpAtcion(action: string) {

    if (action === 'edit'){
        this.showCancelButton = true;
        this.showSaveButton = true;
        this.showEditButton = false;
    }

    this.breadcrumbService.breadcrumbAction.emit(action);
  }

  getUntratedUrls(url: string): string[] {
    return url
      .split('/')
      .map((path) => {
        return path.includes('?') ? path.substring(0, path.indexOf('?')) : path;
      })
      .filter((path) => !this.exclusionList.includes(path));
  }

  checkActionButtons() {
    const actionOnPage = this.untratedUrls[this.untratedUrls.length - 1];

    switch (actionOnPage) {
      case 'editar':
        this.showEditButton = this.canShowEditButton();
        this.showSaveButton = false;
        this.showCancelButton = false;
        break;
      case 'criar':
        this.showEditButton = false;
        this.showSaveButton = true;
        this.showCancelButton = true;
        break;
      default:
        this.showEditButton = this.showSaveButton = this.showCancelButton = false;
        break;
    }
  }

  canShowEditButton() {
    const userPermissions: Array<string> = JSON.parse(sessionStorage.getItem('user-profile')!).permissoes ?? [];
    const route = this._router.url.replaceAll('/main/', '').split('/')[0];
    const isAdmin = userPermissions.includes(PermissionsMap['adminAuth' as keyof typeof PermissionsMap]);
    const canEdit = userPermissions.includes(PermissionsMap[(route + 'editar') as keyof typeof PermissionsMap]);
    return isAdmin || canEdit;
  }

}
