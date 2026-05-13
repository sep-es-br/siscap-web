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
    ReactiveFormsModule, TemplatesModule],
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
    this.criarFormulario();
    this.preencherMetasPorIntervaloGestao();
    this.monitorarBaseReferencia();
  }

  private criarFormulario(): void {

    this.formIndicador = this.fb.group({
      nomeIndicador: ['', Validators.required],
      fonteIndicador: [''],
      medidoPor: ['', Validators.required],
      unidadeMedida: ['', Validators.required],
      basedeReferencia: ['', Validators.required],
      polaridade: [''],
      metasIndicador: this.fb.array([]),
      metasIndicadorProjeto: this.fb.array([]),
      maiorAnoInidicador: [null],
      maiorMetaIndicador: ['']
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
    
    this.loading = false;

    this.close.emit();

  }

  removerMetaIndicador(index: number): void {
    this.getMetasIndicador().removeAt(index);
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

  private criarFormIndicadorComDados(dados: any): FormGroup {

    console.log(dados.metasIndicadorProjeto);

    return this.fb.group({
      nomeIndicador: [dados.nomeIndicador, Validators.required],
      fonteIndicador: [dados.fonteIndicador],
      medidoPor: [dados.medidoPor, Validators.required],
      unidadeMedida: [dados.unidadeMedida, Validators.required],
      basedeReferencia: [dados.basedeReferencia, Validators.required],
      polaridade: [dados.polaridade],
      maiorAnoIndicador: [dados.maiorAnoIndicador],
      maiorMetaIndicador: [dados.maiorMetaIndicador],
      metasIndicador: this.fb.array(
        dados.metasIndicador.map((meta: any) =>
          this.fb.group({
            anoMeta: [meta.anoMeta],
            valorMeta: [meta.valorMeta, Validators.required]
          })
        )
      ),
      metasIndicadorProjeto: this.fb.array(
        dados.metasIndicadorProjeto.map((meta: any) =>
          this.fb.group({
            anoMeta: [meta.anoMeta],
            valorMeta: [meta.valorMeta, Validators.required]
          })
        )
      )
    });

  }

  private monitorarBaseReferencia(): void {
    this.getMetasIndicador()
      .valueChanges
      .subscribe(() => {
        this.atualizarBaseReferencia();
      });
  }

  private atualizarBaseReferencia(): void {

    const metas = this.getMetasIndicador().value;

    if (!metas || metas.length === 0) {
      this.formIndicador
        .get('basedeReferencia')
        ?.setValue('');
      return;
    }

    let maiorMeta = null;

    for (const meta of metas) {
      if (!maiorMeta || meta.anoMeta > maiorMeta.anoMeta) {
        maiorMeta = meta;
      }
    }

    const valor = maiorMeta?.valorMeta
      ? `${maiorMeta.valorMeta} (${maiorMeta.anoMeta})`
      : '';

    this.formIndicador
      .get('basedeReferencia')
      ?.setValue(valor, { emitEvent: false });

  }


}
