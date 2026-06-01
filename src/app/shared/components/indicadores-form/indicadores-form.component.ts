import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, AbstractControl, NonNullableFormBuilder } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbTooltipModule, NgbModalModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { IndicadoresService } from '../../../core/services/indicadores/indicadores.service';
import { TemplatesModule } from '../../templates/templates.module';
import { COLECAO_TEXTO_TOOLTIP_FORMULARIO_PROJETO } from '../../../core/utils/constants';
import { TipoStatusEnum } from '../../../core/enums/tipo-status.enum';
import { ToastService } from '../../../core/services/toast/toast.service';
import { IndicadoresFormType, MetaIndicadorExternoFormType } from '../../../core/types/form/indicadores-form.type';

@Component({
  selector: 'siscap-indicadores-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgbTooltipModule,
    NgbModalModule,
    NgbPopoverModule,
    TemplatesModule,
  ],
  templateUrl: './indicadores-form.component.html',
})
export class IndicadoresFormComponent {

  @Input() tipoIndicador: string;
  @Input() public isModoEdicao: boolean = false;
  @Input() descricaoIndicador: string;
  @Input() descricaoMeta: string;

  public TipoStatusEnum = TipoStatusEnum;

  public indicadorForm: FormGroup = new FormGroup({});

  constructor(
    private readonly _nnfb: NonNullableFormBuilder,
    public indicadoresService: IndicadoresService,
    private readonly _toastService: ToastService,
    private fb: FormBuilder) {
    this.tipoIndicador = '';
    this.descricaoIndicador = '';
    this.descricaoMeta = '';
  }

  ngOnInit(): void {

    this.indicadorForm = this._nnfb.group({
      tipoIndicador: this._nnfb.control(this.tipoIndicador ?? null, [
        Validators.maxLength(80),
        Validators.required,
      ]),
      descricaoIndicador: this._nnfb.control(this.descricaoIndicador ?? null, [
        Validators.maxLength(2000),
        Validators.required,
      ]),
      descricaoMeta: this._nnfb.control(
        this.descricaoMeta ?? null, [
        Validators.maxLength(2000),
        Validators.required,
      ]),
    })

  }

  public adicionarIndicador(): void {

    const novoIndicador = this._nnfb.group<IndicadoresFormType>({
      idIndicador: this._nnfb.control(0, [Validators.required]),
      tipoIndicador: this._nnfb.control(null, [Validators.required]),
      descricaoIndicador: this._nnfb.control(null, [Validators.required]),
      descricaoMeta: this._nnfb.control(null, [Validators.required]),
      idStatus: this._nnfb.control(TipoStatusEnum.Ativo,),
      idIndicadorCatalogoExterno: this._nnfb.control(null),
      metasIndicadorProjeto: this._nnfb.array<FormGroup<MetaIndicadorExternoFormType>>([])
    });

    this.indicadoresFormArray.push(novoIndicador);

  }

  public projetoTooltip: Record<string, string> =
    COLECAO_TEXTO_TOOLTIP_FORMULARIO_PROJETO;

  removerIndicador(index: number): void {
    this.indicadoresFormArray.removeAt(index);
  }

  public marcarIndicadorExcluido(
    index: number
  ) {

    const indicadorFormGroup = this.indicadoresService.indicadoresFormArray.at(index) as FormGroup;

    indicadorFormGroup.get('idStatus')?.setValue(TipoStatusEnum.Inativo);

    indicadorFormGroup.get('tipoIndicador')?.clearValidators();
    indicadorFormGroup.get('tipoIndicador')?.updateValueAndValidity();

    indicadorFormGroup.get('descricaoIndicador')?.clearValidators();
    indicadorFormGroup.get('descricaoIndicador')?.updateValueAndValidity();

    indicadorFormGroup.get('descricaoMeta')?.clearValidators();
    indicadorFormGroup.get('descricaoMeta')?.updateValueAndValidity();

    indicadorFormGroup.markAsDirty();
    indicadorFormGroup.updateValueAndValidity();

    const tipoIndicador = indicadorFormGroup.get('tipoIndicador')?.value || 'Indicador';
    const descricaoIndicador = indicadorFormGroup.get('descricaoIndicador')?.value || '';

    this._toastService.showToast(
      'info',
      'Indicador removido do projeto.',
      [
        `${tipoIndicador}`,
        `${descricaoIndicador.substring(0, 50)}${descricaoIndicador.length > 50 ? '...' : ''}`
      ]
    );
  }

  public isNovoMembro(index: number): boolean {
    return !this.indicadoresService.indicadoresFormArraySnapshot.some(
      (membro) =>
        membro.idIndicador ===
        this.indicadoresService.indicadoresFormArray.at(index).value.idIndicador
    );
  }

  public isIndicadorAtivo(index: number): boolean {
    const indicadorFormGroup = this.indicadoresService.indicadoresFormArray.at(index);
    return indicadorFormGroup.get('idStatus')?.value !== TipoStatusEnum.Inativo;
  }

  get indicadoresFormArray(): FormArray {
    return this.indicadoresService.indicadoresFormArray;
  }

  public getControl(controlName: string): AbstractControl<any, any> {
    return this.indicadorForm.get(controlName) as AbstractControl<any, any>;
  }

}
