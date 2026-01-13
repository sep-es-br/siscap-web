import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, AbstractControl } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbTooltipModule, NgbModalModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { AcoesService } from '../../../core/services/acoes/acoes.service';
import { NgxMaskTransformFunctionHelper } from '../../../core/helpers/ngx-mask-transform-function.helper';
import { NgxMaskDirective } from 'ngx-mask';
import { TemplatesModule } from '../../templates/templates.module';
import { COLECAO_TEXTO_TOOLTIP_FORMULARIO_PROJETO } from '../../../core/utils/constants';
import { ToastService } from '../../../core/services/toast/toast.service';
import { TipoStatusEnum } from '../../../core/enums/tipo-status.enum';
// import { RateioService } from '../../../core/services/rateio/rateio.service';
import { getSimboloMoeda } from '../../../core/utils/functions';
import { ValorService } from '../../../core/services/valor/valor.service';
import { NgxMaskPipe } from 'ngx-mask';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs';

@Component({
  selector: 'siscap-acoes-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgbTooltipModule,
    NgbModalModule,
    NgbPopoverModule,
    NgxMaskDirective,
    TemplatesModule,
    NgxMaskPipe
  ],
  templateUrl: './acoes-form.component.html',
})
export class AcoesFormComponent {
  mensagemComplementarCampo(arg0: string): string {
    throw new Error('Method not implemented.');
  }
  deveComplementarCampo(arg0: string): any {
    throw new Error('Method not implemented.');
  }
  getControl(arg0: string): AbstractControl<any, any> {
    throw new Error('Method not implemented.');
  }

  @Input() public isModoEdicao: boolean = false;
  @Input() moedaProjeto: string;

  public descricaoAcaoPrincipal: string;
  public descricaoAcaoSecundaria: string;
  public valorEstimadoAcaoPrincipal: number;
  public idStatus: number;

  public valorEstimadoDIC: number;
  public totalAcoesAtivas: number;
  public totalFaltandoEmValorAcoes: number;

  constructor(
    public acoesService: AcoesService,
    private readonly _toastService: ToastService,
    private fb: FormBuilder,
    public valorService: ValorService) {
    this.moedaProjeto = '';
    this.descricaoAcaoPrincipal = '';
    this.descricaoAcaoSecundaria = '';
    this.valorEstimadoAcaoPrincipal = 0;
    this.idStatus = 0;
    this.valorEstimadoDIC = 0;
    this.totalAcoesAtivas = 0;
    this.totalFaltandoEmValorAcoes = 0;
  }

  ngOnInit() {

    this.valorService.valorFormGroup.valueChanges.subscribe(valor => {
      this.valorEstimadoDIC = valor.quantia ?? 0;
      this.recalcularTotais();
    });

    this.acoesService.acoesFormArray.valueChanges.subscribe(() => {
      this.totalAcoesAtivas =
        this.acoesService.calcularTotalAcoesAtivas();
        this.recalcularTotais();
    });

  }

  public getSimboloMoeda: (moeda: string | undefined | null) => string =
    getSimboloMoeda;

  public TipoStatusEnum = TipoStatusEnum;

  public projetoTooltip: Record<string, string> =
    COLECAO_TEXTO_TOOLTIP_FORMULARIO_PROJETO;

  public rtlCurrencyInputTransformFn =
    NgxMaskTransformFunctionHelper.rtlCurrencyInputTransformFn;

  public rtlCurrencyOutputTransformFn =
    NgxMaskTransformFunctionHelper.rtlCurrencyOutputTransformFn;

  adicionarAcao(): void {
    const novaAcao = this.fb.group({
      descricaoAcaoPrincipal: ['', [
        Validators.required,
        Validators.maxLength(2000),
      ]],
      descricaoAcaoSecundaria: ['', [
        Validators.required,
        Validators.maxLength(2000),
      ]],
      valorEstimadoAcaoPrincipal: ['', [
        Validators.required,
      ]],
      idStatus: [TipoStatusEnum.Ativo,]
    });
    this.acoesFormArray.push(novaAcao);
  }

  removerAcao(index: number): void {
    this.acoesFormArray.removeAt(index);
  }

  public marcarAcaoExcluida(index: number) {

    const acaoFormGroup = this.acoesService.acoesFormArray.at(index) as FormGroup;

    acaoFormGroup.get('idStatus')?.setValue(TipoStatusEnum.Inativo);

    const acaoPrincipal = acaoFormGroup.get('descricaoAcaoPrincipal')?.value || 'Ação';
    const acaoSecundaria = acaoFormGroup.get('descricaoAcaoSecundaria')?.value || '';

    this._toastService.showToast(
      'info',
      'Indicador removido do projeto.',
      [
        `${acaoPrincipal}`,
        `${acaoSecundaria.substring(0, 50)}${acaoSecundaria.length > 50 ? '...' : ''}`
      ]
    );

  }

  public isNovaAcao(index: number): boolean {
    return !this.acoesService.acoesFormArraySnapshot.some(
      (membro) =>
        membro.idAcao ===
        this.acoesService.acoesFormArray.at(index).value.idAcao
    );
  }

  public isAcaoAtiva(index: number): boolean {
    const acaoFormGroup = this.acoesService.acoesFormArray.at(index);
    return acaoFormGroup.get('idStatus')?.value !== 2;
  }

  get acoesFormGroups(): FormGroup[] {
    return this.acoesFormArray.controls as FormGroup[];
  }

  get acoesFormArray(): FormArray {
    return this.acoesService.acoesFormArray;
  }

  private recalcularTotais(): void {
    this.totalFaltandoEmValorAcoes =
      this.valorEstimadoDIC - this.totalAcoesAtivas;
  }

}
