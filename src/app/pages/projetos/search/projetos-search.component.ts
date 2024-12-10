import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { debounceTime, Observable, tap } from 'rxjs';

import { OpcoesDropdownService } from '../../../core/services/opcoes-dropdown/opcoes-dropdown.service';

import { IOpcoesDropdown } from '../../../core/interfaces/opcoes-dropdown.interface';

import { StatusProjetoEnum } from '../../../core/enums/status-projeto.enum';
import { TEMPO_INPUT_USUARIO } from '../../../core/utils/constants';

@Component({
  selector: 'siscap-projetos-pesquisa',
  standalone: false,
  templateUrl: './projetos-search.component.html',
  styleUrl: './projetos-search.component.scss',
})
export class ProjetosPesquisaComponent implements OnInit {
  private _getOrganizacoesOpcoes$: Observable<IOpcoesDropdown[]>;

  public statusProjetoOpcoes: Array<string> = [];
  public organizacoesOpcoes: Array<IOpcoesDropdown> = [];

  public projetosPesquisaForm: FormGroup;

  // CRIAR OUTPUT DE FORM.VALUE (JÁ PREPARAR A QUERY PARAMS STRING?)

  constructor(private readonly _opcoesDropdownService: OpcoesDropdownService) {
    this.statusProjetoOpcoes = ['Todos', ...Object.values(StatusProjetoEnum)];

    this._getOrganizacoesOpcoes$ = this._opcoesDropdownService
      .getOpcoesOrganizacoes()
      .pipe(
        tap((response) => {
          this.organizacoesOpcoes = [{ id: 0, nome: 'Todos' }];

          this.organizacoesOpcoes = this.organizacoesOpcoes.concat(response);
        })
      );

    this.projetosPesquisaForm = new FormGroup({
      sigla: new FormControl(''),
      titulo: new FormControl(''),
      status: new FormControl('Todos'),
      organizacao: new FormControl(0),
      data: new FormControl(''),
    });

    this.projetoPesquisaFormValueChanges();
  }

  ngOnInit(): void {
    this._getOrganizacoesOpcoes$.subscribe();
  }

  private projetoPesquisaFormValueChanges(): void {
    this.projetosPesquisaForm.valueChanges
      .pipe(debounceTime(TEMPO_INPUT_USUARIO))
      .subscribe((value) => {
        console.log(value);
      });
  }
}
