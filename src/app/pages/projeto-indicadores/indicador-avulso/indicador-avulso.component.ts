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
import { TemplatesModule } from '../../../shared/templates/templates.module';

@Component({
  selector: 'siscap-indicador-avulso',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule, TemplatesModule],
  templateUrl: './indicador-avulso.component.html',
  styleUrl: './indicador-avulso.component.scss'
})
export class IndicadorAvulsoComponent {
  @Input() gestao: IGestoesCatalogoExterno | null = null;
  @Input() formProjeto!: FormGroup;
  @Output() close = new EventEmitter<void>();
  @Output() indicadorCriado = new EventEmitter<void>();

  loading: boolean = false;

  formIndicador!: FormGroup;

  constructor(
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.criarFormulario();
    this.preencherMetasPorIntervaloGestao();
  }

  private criarFormulario(): void {
    this.formIndicador = this.fb.group({
      nomeIndicador: ['', Validators.required],
      formulaCalculo: ['', Validators.required],
      fonteIndicador: [''],
      medidoPor: ['', Validators.required],
      unidadeMedida: ['', Validators.required],
      basedeReferencia: ['', Validators.required],
      polaridade: [''],
      metasIndicadorProjeto: this.fb.array([]),
      maiorAnoInidicador: [null],
      maiorMetaIndicador: ['']
    });
  };

  private preencherMetasPorIntervaloGestao(): void {

    if (!this.gestao) {
      return;
    }

    const anoInicio = this.gestao.deAnoMeta; // doAno;
    const anoFim = this.gestao.ateAnoMeta;

    for (let ano = anoInicio; ano <= anoFim; ano++) {

      this.getMetasProjeto().push(
        this.fb.group({
          anoMeta: [ano],
          valorMeta: [
                null,
                [Validators.required]
                ]
        })
      );

    }

  }

  getMetasProjeto(): FormArray {
    return this.formIndicador.get('metasIndicadorProjeto') as FormArray;
  }

  salvar(): void {

    if (this.formIndicador.invalid) {
      Object.keys(this.formIndicador.controls).forEach(campo => {
        this.formIndicador.markAllAsTouched();
        const control = this.formIndicador.get(campo);
        if (control?.invalid) {
          console.log(`Campo inválido: ${campo}`);
          console.log('Erros:', control.errors);
          console.log('Valor atual:', control.value);
        }
      });
      return;
    }

    this.loading = true;

    this.indicadoresAvulsos.push(this.formIndicador);

    this.indicadorCriado.emit(this.formIndicador.getRawValue());

    this.loading = false;

    this.close.emit();

  }

  removerMetaProjeto(index: number): void {
    this.getMetasProjeto().removeAt(index);
  }

  fechar() {
    this.close.emit();
  }

  get indicadoresAvulsos(): FormArray {
    return this.formProjeto.get('indicadoresAvulsosProjeto') as FormArray;
  }

  get metasIndicadorAvulsoGeral(): FormArray {
    return this.formIndicador.get('metasIndicadorAvulsoGeral') as FormArray;
  }

  get metasIndicadorAvulsoProjeto(): FormArray {
    return this.formIndicador.get('metasIndicadorProjeto') as FormArray;
  }

  getControl(controlName: string): AbstractControl {
    return this.formIndicador.get(controlName)!;
  }
  
  getMetaIndicadorControl(index: number): AbstractControl {
    return this.metasIndicadorAvulsoGeral.at(index).get('valorMeta')!;
  }

  getMetaProjetoControl(index: number): AbstractControl {
    const formArray = this.formIndicador.get('metasIndicadorProjeto') as FormArray;
    return formArray.at(index).get('valorMeta') as AbstractControl;
  }

  bloquearCaracteresInvalidos(event: KeyboardEvent): void {
    const teclasBloqueadas = ['e', 'E', '+', '-'];
  
    if (teclasBloqueadas.includes(event.key)) {
      event.preventDefault();
    }
  }
  
  bloquearColagemInvalida(event: ClipboardEvent): void {
    const valorColado = event.clipboardData?.getData('text') ?? '';
  
    if (!/^\d+([.,]\d+)?$/.test(valorColado)) {
      event.preventDefault();
    }
    
  }

}
