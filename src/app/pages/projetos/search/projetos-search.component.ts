import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { debounceTime, Observable, tap } from 'rxjs';

import { OpcoesDropdownService } from '../../../core/services/opcoes-dropdown/opcoes-dropdown.service';

import { IOpcoesDropdown } from '../../../core/interfaces/opcoes-dropdown.interface';
import { IProjetoFiltroPesquisa } from '../../../core/interfaces/projeto.interface';

import { StatusProjetoEnum } from '../../../core/enums/status-projeto.enum';
import { TEMPO_INPUT_USUARIO } from '../../../core/utils/constants';
import { UsuarioService } from '../../../core/services/usuario/usuario.service';

@Component({
  selector: 'siscap-projetos-pesquisa',
  standalone: false,
  templateUrl: './projetos-search.component.html',
  styleUrl: './projetos-search.component.scss',
})
export class ProjetosPesquisaComponent implements OnInit {
  private _getOrganizacoesOpcoes$: Observable<IOpcoesDropdown[]>;
  private usuario_IdOrganizacoes: number[] = [];

  public statusProjetoOpcoes: Array<string> = [];
  public organizacoesOpcoes: Array<IOpcoesDropdown> = [];

  public isProponente: boolean = false;

  public projetosPesquisaForm: FormGroup;

  @Output() public pesquisarProjetos: EventEmitter<IProjetoFiltroPesquisa> =
    new EventEmitter<IProjetoFiltroPesquisa>();

  constructor(
    private readonly _opcoesDropdownService: OpcoesDropdownService,
    private readonly _usuarioService: UsuarioService
  ) {
    this.isProponente = this._usuarioService.usuarioPerfil.isProponente;
    this.usuario_IdOrganizacoes =
      this._usuarioService.usuarioPerfil.idOrganizacoes;

    this.statusProjetoOpcoes = ['Status', ...Object.values(StatusProjetoEnum)];

    this._getOrganizacoesOpcoes$ = this._opcoesDropdownService
      .getOpcoesOrganizacoes()
      .pipe(
        tap((response) => {
          if (this.isProponente && this.usuario_IdOrganizacoes.length > 0) {
            const organizacoesOpcoesFiltradas = response.filter((organizacao) =>
              this.usuario_IdOrganizacoes.includes(organizacao.id)
            );

            this.organizacoesOpcoes = organizacoesOpcoesFiltradas;
          } else {
            this.organizacoesOpcoes = [{ id: 0, nome: 'Organização' }];

            this.organizacoesOpcoes = this.organizacoesOpcoes.concat(response);
          }
        })
      );

    const idOrganizacaoValorInicial =
      this.usuario_IdOrganizacoes.length > 0
        ? this.usuario_IdOrganizacoes[0]
        : 0;

    this.projetosPesquisaForm = new FormGroup({
      siglaOuTitulo: new FormControl(''),
      status: new FormControl('Status'),
      idOrganizacao: new FormControl(
        this.isProponente ? idOrganizacaoValorInicial : 0
      ),
    });

    this.projetoPesquisaFormValueChanges();
  }

  ngOnInit(): void {
    this._getOrganizacoesOpcoes$.subscribe();

    this.pesquisarProjetos.emit(this.projetosPesquisaForm.value);
  }

  private projetoPesquisaFormValueChanges(): void {
    this.projetosPesquisaForm.valueChanges
      .pipe(debounceTime(TEMPO_INPUT_USUARIO))
      .subscribe((projetoPesquisaFormValue) => {
        this.pesquisarProjetos.emit(projetoPesquisaFormValue);
      });
  }
}
