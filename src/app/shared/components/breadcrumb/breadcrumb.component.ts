import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { BreadcrumbService } from '../../../core/services/breadcrumb/breadcrumb.service';

import {
  IBreadcrumbBotaoAcao,
  IBreadcrumbItem,
} from '../../../core/interfaces/breadcrumb.interface';

import { BREADCRUMB_COLECAO_CAMINHO_TITULO } from '../../../core/utils/constants';
import { UsuarioService } from '../../../core/services/usuario/usuario.service';

@Component({
  selector: 'siscap-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss',
})
export class BreadcrumbComponent {
  public paginaAtual: IBreadcrumbItem = { titulo: '', caminho: '' };
  public listaBreadcrumbItems: Array<IBreadcrumbItem> = [];

  public isProponente: boolean = false;

  public listaBotoesAcao: Array<string> = [];
  public contextoBotoesAcao: string = '';

  constructor(
    private readonly _breadcrumbService: BreadcrumbService,
    private readonly _usuarioService: UsuarioService
  ) {
    this.isProponente = this._usuarioService.usuarioPerfil.isProponente;

    this._breadcrumbService.listaBreadcrumbItems$.subscribe(
      (breadcrumbItemArray: Array<IBreadcrumbItem>) => {
        this.paginaAtual = breadcrumbItemArray[breadcrumbItemArray.length - 1];
        this.listaBreadcrumbItems = breadcrumbItemArray;
      }
    );

    this._breadcrumbService.breadcrumbBotoesAcao$.subscribe(
      (breadcrumbBotoesAcaoObj: IBreadcrumbBotaoAcao) => {
        this.listaBotoesAcao = breadcrumbBotoesAcaoObj.botoes;
        this.contextoBotoesAcao = breadcrumbBotoesAcaoObj.contexto;
      }
    );

    this._breadcrumbService.acaoBreadcrumb$.subscribe((acao) => {
      if (acao == 'editar') {
        this.exibirBotoesSalvarCancelar();
      }
    });
  }

  public buscarTextoBotaoCriar(contexto: string): string {
    if (contexto === 'projetos' && this.isProponente) {
      return 'Novo DIC';
    }

    return BREADCRUMB_COLECAO_CAMINHO_TITULO[contexto + 'criar'];
  }

  public emitirAcaoBreadcrumb(acao: string): void {
    this._breadcrumbService.acaoBreadcrumb$.next(acao);
  }

  private exibirBotoesSalvarCancelar(): void {
    this.listaBotoesAcao = ['salvar', 'cancelar'];
  }
}
