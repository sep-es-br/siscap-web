import { Component, EventEmitter, Output } from '@angular/core';
import { IProgramaFiltroPesquisa } from '../../../core/interfaces/programa.interface';
import { FormControl, FormGroup } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { TEMPO_INPUT_USUARIO } from '../../../core/utils/constants';
import { StatusProgramaEnum } from '../../../core/enums/status-programa.enum';

@Component({
  selector: 'siscap-programas-search',
  templateUrl: './programas-search.component.html',
  styleUrl: './programas-search.component.scss'
})
export class ProgramasSearchComponent {
  @Output() pesquisarProgramas = new EventEmitter<IProgramaFiltroPesquisa>();

  programasPesquisaForm!: FormGroup;

  programasStatusOpcoes = ['Status', ...Object.values(StatusProgramaEnum)];

  constructor() {
    this.programasPesquisaForm = new FormGroup({
      status: new FormControl('Status'),
      search: new FormControl(''),
    });

    this.programasPesquisaForm.valueChanges
      .pipe(debounceTime(TEMPO_INPUT_USUARIO))
      .subscribe(() => {
        this.pesquisarProgramas.emit(this.programasPesquisaForm.getRawValue());
      });
  }
}
