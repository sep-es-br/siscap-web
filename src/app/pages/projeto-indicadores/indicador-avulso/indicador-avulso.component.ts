import { Component, EventEmitter, Input, Output } from '@angular/core';

import {
  AbstractControl,
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
import { TemplatesModule } from '../../../shared/templates/templates.module';

@Component({
  selector: 'siscap-indicador-avulso',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,TemplatesModule],
  templateUrl: './indicador-avulso.component.html',
  styleUrl: './indicador-avulso.component.scss'
})
export class IndicadorAvulsoComponent {
  @Input() gestao: IGestoesCatalogoExterno | null = null;
  @Input() formProjeto!: FormGroup;
  @Output() close = new EventEmitter<void>();

  loading: boolean = false;

  formIndicador!: FormGroup;

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
    this.formIndicador = this.fb.group({
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
    return this.formIndicador.get('metasIndicador') as FormArray;
  }

  getMetasProjeto(): FormArray {
    return this.formIndicador.get('metasIndicadorProjeto') as FormArray;
  }

  salvar(): void {

    if (this.formIndicador.invalid) {
      this.formIndicador.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.indicadoresAvulsos.push(
      this.formIndicador
    );

  }

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
    console.log('Fechando modal de indicador avulso');
    this.close.emit();
  }

  get indicadoresAvulsos(): FormArray {
    return this.formProjeto.get('indicadoresAvulsos') as FormArray;
  }

  get metasIndicador(): FormArray {
    return this.formIndicador.get('metasIndicador') as FormArray;
  }
  
  get metasIndicadorProjeto(): FormArray {
    return this.formIndicador.get('metasIndicadorProjeto') as FormArray;
  }

  getControl(controlName: string): AbstractControl {
    return this.formIndicador.get(controlName)!;
  }

  getMetaIndicadorControl(index: number): AbstractControl {
    return this.metasIndicador.at(index).get('valorMeta')!;
  }

}
