import { MENSAGENS, formatarMensagem } from '../../core/utils/constants';
import { Component, TemplateRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from 'rxjs';
import { VersionService } from '../../core/services/version/version.service';

import { UsuarioService } from '../../core/services/usuario/usuario.service';

@Component({
  selector: 'siscap-main',
  standalone: false,
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent {
  public readonly MENSAGENS = MENSAGENS;
  public readonly formatarMensagem = formatarMensagem;

  public isProponente: boolean = false;

  currentYear: number = 2024;
  versaoApi$: Observable<string> = of('Não disponível');
  versaoWebApp$: Observable<string> = of('Não disponível');

  constructor(
    private readonly _usuarioService: UsuarioService,
    private readonly modalService: NgbModal,
    private readonly versionService: VersionService,
  ) {
    this.isProponente = this._usuarioService.usuarioPerfil.isProponente;

    this.currentYear = new Date().getFullYear();
  }

  abrirSobre(conteudo: TemplateRef<unknown>): void {
    this.versaoApi$ = this.versionService.consultarApi();
    this.versaoWebApp$ = this.versionService.consultarWebApp();
    this.modalService.open(conteudo, {
      centered: true,
      animation: false,
      backdrop: 'static',
      ariaLabelledBy: 'sobre-modal-titulo',
    });
  }
}
