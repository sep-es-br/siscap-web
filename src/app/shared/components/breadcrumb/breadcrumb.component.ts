import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { BotaoComponent } from '../botao/botao.component';

import { LoadingService } from '../../../core/services/loading/loading.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb/breadcrumb.service';
import { UsuarioService } from '../../../core/services/usuario/usuario.service';

import { BotaoPropriedadesModel } from '../botao/botao.model';

import { TBotaoAcao } from '../botao/botao.config';

import { IBreadcrumbItem } from '../../../core/interfaces/breadcrumb.interface';

@Component({
  selector: 'siscap-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule, BotaoComponent],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss',
})
export class BreadcrumbComponent {
  public paginaAtual: IBreadcrumbItem = { titulo: '', caminho: '' };
  public itemsBreadcrumb: Array<IBreadcrumbItem> = [];

  public isProponente: boolean = false;

  public botoesAcaoPropriedades: Array<BotaoPropriedadesModel> = [];

  constructor(
    public loadingService: LoadingService,
    private readonly _breadcrumbService: BreadcrumbService,
    private readonly _usuarioService: UsuarioService
  ) {
    this.isProponente = this._usuarioService.usuarioPerfil.isProponente;

    this._breadcrumbService.listaItemsBreadcrumb$.subscribe(
      (itemsBreadcrumb: Array<IBreadcrumbItem>) => {
        this.paginaAtual = itemsBreadcrumb[itemsBreadcrumb.length - 1];
        this.itemsBreadcrumb = itemsBreadcrumb;
      }
    );

    this._breadcrumbService.listaBotaoAcaoPropriedades$.subscribe(
      (botoesAcaoPropriedades) => {
        this.botoesAcaoPropriedades = botoesAcaoPropriedades;
      }
    );

    this.loadingService.isProcessando$.subscribe((isProcessando) => {
      this.botoesAcaoPropriedades.forEach(
        (botaoAcao) => (botaoAcao.desabilitado = isProcessando)
      );
    });
  }

  public emitirAcaoBreadcrumb(acao: TBotaoAcao): void {
    this._breadcrumbService.executarAcaoBotao$.next(acao);
  }
}
