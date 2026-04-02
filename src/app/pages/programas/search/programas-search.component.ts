import { Component, EventEmitter, Output } from '@angular/core';
import { IProgramaFiltroPesquisa, StatusPrograma, StatusProgramaLabel } from '../../../core/interfaces/programa.interface';
import { FormControl, FormGroup } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { TEMPO_INPUT_USUARIO } from '../../../core/utils/constants';

@Component({
  selector: 'siscap-programas-search',
  templateUrl: './programas-search.component.html',
  styleUrl: './programas-search.component.scss'
})
export class ProgramasSearchComponent {
  @Output() pesquisarProgramas = new EventEmitter<IProgramaFiltroPesquisa>();

  programasPesquisaForm!: FormGroup;

  programasStatusOpcoes: Array<{ value: StatusPrograma; label: string; }> =
    Object
      .entries(StatusProgramaLabel)
      .map(([key, label]) => ({
        value: Number(key),
        label,
      })
  );

  constructor() {
    this.programasPesquisaForm = new FormGroup({
      status: new FormControl<number | null>(-1),
      porTermo: new FormControl<string>(''),
    });

    this.programasPesquisaForm.valueChanges
      .pipe(debounceTime(TEMPO_INPUT_USUARIO))
      .subscribe(() => {
        const filtro = this.programasPesquisaForm.getRawValue();
        this.pesquisarProgramas.emit(filtro);
      });
  }
}
