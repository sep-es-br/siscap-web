import { MENSAGENS } from '../../../core/utils/constants';
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
  selector: 'siscap-projetos-search',
  standalone: false,
  templateUrl: './projetos-search.component.html',
  styleUrl: './projetos-search.component.scss',
})
export class ProjetosSearchComponent implements OnInit {
  public readonly MENSAGENS = MENSAGENS;

  private _getOrganizacoesOpcoes$: Observable<IOpcoesDropdown[]>;
  private usuario_IdOrganizacoes: number[] = [];

  public statusProjetoOpcoes: Array<string> = [];
  public organizacoesOpcoes: Array<IOpcoesDropdown> = [];

  public isProponente: boolean = false;
  public isSubcap: boolean = false;

  public isSubepp: boolean = false;
  public isSubeo: boolean = false;

  public projetosPesquisaForm: FormGroup;

  public podeSelecionarOrganizacaoFlag = false;

  @Output() public pesquisarProjetos: EventEmitter<IProjetoFiltroPesquisa> =
    new EventEmitter<IProjetoFiltroPesquisa>();

  constructor(
    private readonly _opcoesDropdownService: OpcoesDropdownService,
    private readonly _usuarioService: UsuarioService
  ) {
    this.isProponente = this._usuarioService.usuarioPerfil.isProponente;
    this.isSubcap = this._usuarioService.usuarioPerfil.isSubcap;
    this.usuario_IdOrganizacoes =
      this._usuarioService.usuarioPerfil.idOrganizacoes;

    this.statusProjetoOpcoes = ['Status', ...Object.values(StatusProjetoEnum)];

    this._getOrganizacoesOpcoes$ = this._opcoesDropdownService
      .getOpcoesOrganizacoes()
      .pipe(
        tap((response) => {
          const organizacoes = response.map(organizacao => ({
            ...organizacao,
            nome: this.nomeOrganizacaoSemSiglaDuplicada(organizacao.nome),
          }));
          if (
            !this.isSubcap &&
            this.isProponente &&
            this.usuario_IdOrganizacoes.length > 0
          ) {
            const organizacoesOpcoesFiltradas = organizacoes.filter((organizacao) =>
              this.usuario_IdOrganizacoes.includes(organizacao.id)
            );
            this.organizacoesOpcoes = organizacoesOpcoesFiltradas;
          } else {
            this.organizacoesOpcoes = [{ id: 0, nome: MENSAGENS.TODAS }];
            this.organizacoesOpcoes = this.organizacoesOpcoes.concat(organizacoes);
          }
        })
      );

    const idOrganizacaoValorInicial =
      !this.isSubcap && this.usuario_IdOrganizacoes.length > 0
        ? this.usuario_IdOrganizacoes[0]
        : 0;

    this.projetosPesquisaForm = new FormGroup({
      siglaOuTitulo: new FormControl(''),
      status: new FormControl('Status'),
      idOrganizacao: new FormControl(idOrganizacaoValorInicial),
      /*idOrganizacao: new FormControl(
        this.isProponente ? idOrganizacaoValorInicial : 0
      ),*/
    });

    this.projetoPesquisaFormValueChanges();
  }

  ngOnInit(): void {
    this._getOrganizacoesOpcoes$.subscribe();

    this.pesquisarProjetos.emit(this.projetosPesquisaForm.value);

    if (this.podeSelecionarOrganizacao()) {
      this.projetosPesquisaForm
        .get('idOrganizacao')
        ?.enable({ emitEvent: false });
    } else {
      this.projetosPesquisaForm
        .get('idOrganizacao')
        ?.disable({ emitEvent: false });
    }
  }

  private projetoPesquisaFormValueChanges(): void {
    this.projetosPesquisaForm.valueChanges
      .pipe(debounceTime(TEMPO_INPUT_USUARIO))
      .subscribe(() => {
        this.pesquisarProjetos.emit(this.projetosPesquisaForm.getRawValue());
      });
  }

  private nomeOrganizacaoSemSiglaDuplicada(nome: string): string {
    const texto = nome.trim();
    const partes = texto.match(/^([A-ZÀ-Ý0-9][A-ZÀ-Ý0-9./&-]*)\s+-\s+(.+)$/);
    const descricao = partes ? partes[2].trim() : texto;
    const sufixo = descricao.match(/\s+[-–—]\s*([A-ZÀ-Ý0-9][A-ZÀ-Ý0-9./&-]{0,24})\s*$/);
    const nomeSemSiglaFinal = sufixo
      ? descricao.slice(0, sufixo.index).trim()
      : descricao;
    return partes ? `${partes[1]} - ${nomeSemSiglaFinal}` : nomeSemSiglaFinal;
  }

  public podeSelecionarOrganizacao(): boolean {
    return this.isSubcap;
  }
}
