import { Component, EventEmitter, Input, Output } from '@angular/core';

import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IGestoesCatalogoExterno } from '../../../core/interfaces/indicadores-catalogo-externo.interface';
import { finalize } from 'rxjs/internal/operators/finalize';
import { CatalogoIndicadorService } from '../../../core/services/catalogo-indicadores/catalogo-indicador.service';

@Component({
  selector: 'siscap-indicador-avulso',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule],
  templateUrl: './indicador-avulso.component.html',
  styleUrl: './indicador-avulso.component.scss'
})
export class IndicadorAvulsoComponent {
  @Input() gestao: IGestoesCatalogoExterno | null = null;
  @Output() close = new EventEmitter<void>();

  loading: boolean = false;

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private catalogoIndicadorService: CatalogoIndicadorService,
  ) { }

  ngOnInit(): void {
    // console.log('Gestão recebida:', this.gestao);
    this.criarFormulario();
    this.preencherMetasPorIntervaloGestao();
  }

  private criarFormulario(): void {

    this.form = this.fb.group({
      nomeIndicador: ['', Validators.required],
      fonteIndicador: ['', Validators.required],
      medidoPor: ['', Validators.required],
      unidadeMedida: ['', Validators.required],
      basedeReferencia: ['', Validators.required],
      metasIndicador: this.fb.array([]),
      metasIndicadorProjeto: this.fb.array([])
    });

  };

  private preencherMetasPorIntervaloGestao(): void {

    if (!this.gestao) {
      return;
    }

    const anoInicio = this.gestao.doAno;
    const anoFim = this.gestao.ateAno;

    for (let ano = anoInicio; ano <= anoFim; ano++) {

      // META DO INDICADOR
      this.getMetasIndicador().push(
        this.fb.group({
          anoMeta: [ano],
          valorMeta: [null, Validators.required]
        })
      );

      // META DO PROJETO
      this.getMetasProjeto().push(
        this.fb.group({
          anoMeta: [ano],
          valorMeta: [null, Validators.required]
        })
      );

    }

  }

  getMetasIndicador(): FormArray {
    return this.form.get('metasIndicador') as FormArray;
  }

  getMetasProjeto(): FormArray {
    return this.form.get('metasIndicadorProjeto') as FormArray;
  }

  salvar(): void {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    // this.catalogoIndicadorService
    //   .salvarIndicadorAvulso(this.form.getRawValue())
    //   .pipe(finalize(() => this.loading = false))
    //   .subscribe({
    //     next: (response) => {
    //       this.close.emit(response);
    //     },
    //     error: (err) => {
    //       console.error(err);
    //     }
    //   });

  }

  // =========================================================
  // META INDICADOR
  // =========================================================
  adicionarMetaIndicador(): void {

    const metaForm = this.fb.group({
      anoMeta: [null, Validators.required],
      valorMeta: [null, Validators.required]
    });

    this.getMetasIndicador().push(metaForm);

  }

  removerMetaIndicador(index: number): void {
    this.getMetasIndicador().removeAt(index);
  }

  // =========================================================
  // META PROJETO
  // =========================================================
  adicionarMetaProjeto(): void {

    const metaProjetoForm = this.fb.group({
      anoMeta: [null, Validators.required],
      valorMeta: [null, Validators.required]
    });

    this.getMetasProjeto().push(metaProjetoForm);

  }

  removerMetaProjeto(index: number): void {
    this.getMetasProjeto().removeAt(index);
  }

  fechar() {
    this.close.emit();
  }

}
