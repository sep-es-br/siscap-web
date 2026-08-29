import { Component, Input } from '@angular/core';
import { FormArray, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AcoesFormComponent } from '../../../shared/components/acoes-form/acoes-form.component';
import { ValorFormComponent } from '../../../shared/components/valor-form/valor-form.component';
import { IMoeda } from '../../../core/interfaces/moeda.interface';
import { CommonModule } from '@angular/common';
import { FormWarningTooltipComponent } from '../../../shared/templates/form-warning-tooltip/form-warning-tooltip.component';
import { IOpcoesDropdown } from '../../../core/interfaces/opcoes-dropdown.interface';
import { IEstruturaCamposComplementarProjeto } from '../../../core/interfaces/estrutura.campo.complementar.dic.interface';
import { SharedModule } from 'primeng/api';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbModalModule, NgbPopoverModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TemplatesModule } from '../../../shared/templates/templates.module';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { StatusProjetoEnum } from '../../../core/enums/status-projeto.enum';
import { RateioFormComponent } from '../../../shared/components/rateio-form/rateio-form.component';
import { COLECAO_TEXTO_TOOLTIP_FORMULARIO_PROJETO } from '../../../core/utils/constants';
import { IAcao } from '../../../core/interfaces/acoes.interface';
import { AcoesService } from '../../../core/services/acoes/acoes.service';

@Component({
  selector: 'siscap-projeto-acoes-rateio',
  standalone: true,
  imports: [ValorFormComponent,
    AcoesFormComponent,
    RateioFormComponent,
    CommonModule,
    SharedModule,
    NgSelectModule,
    NgbTooltipModule,
    NgbModalModule,
    NgbPopoverModule,
    TemplatesModule,
    CheckboxModule,
    FormsModule,
    InputTextModule,
    TooltipModule,
    ReactiveFormsModule
  ],
  templateUrl: './projeto-acoes-rateio.component.html',
  styleUrl: './projeto-acoes-rateio.component.scss'
})
export class ProjetoAcoesRateioComponent {

  @Input() formProjeto!: FormGroup;
  @Input() isModoEdicao: boolean = false;
  @Input() isSubcap: boolean = false;
  @Input() statusProjeto: string = '';

  @Input() moedasList: IMoeda[] = [];
  @Input() tiposValorOpcoes: IOpcoesDropdown[] = [];
  @Input() camposComplementarProjeto: IEstruturaCamposComplementarProjeto[] = [];

  constructor(
    private readonly acoesService: AcoesService
  ) { }

  public projetoTooltip: Record<string, string> =
    COLECAO_TEXTO_TOOLTIP_FORMULARIO_PROJETO;

  public mensagemComplementarCampo(nomeControle: string): string {
    const campoEncontrado = this.camposComplementarProjeto.find(
      (campo) => campo.idCampo === nomeControle,
    );
    return campoEncontrado ? campoEncontrado.descricaoComplemento : '';
  }

  public deveComplementarCampo(nomeControle: string): boolean {
    const deveComplementar = this.camposComplementarProjeto.some(
      (campo) => campo.idCampo === nomeControle,
    );
    return (
      (this.statusProjeto == StatusProjetoEnum.Em_Complementacao &&
        deveComplementar) ||
      false
    );
  }

  private readonly rateiosAbertos = new Set<number>();

  public alternarRateio(index: number): void {
    if (this.rateiosAbertos.has(index)) {
      this.rateiosAbertos.delete(index);
      return;
    }

    this.rateiosAbertos.add(index);
  }

  public rateioAberto(index: number): boolean {
    return this.rateiosAbertos.has(index);
  }

  public get acoesProjeto(): FormArray {
    return this.formProjeto.get('acoesProjeto') as FormArray;
  }

  public adicionarAcao(): void {
    this.acoesProjeto.push(
      this.acoesService.construirAcaoFormGroup()
    );
  }

  public removerAcao(index: number): void {
    this.acoesProjeto.removeAt(index);
  }

  public get valorTotalAcoes(): number {
    return this.acoesProjeto.controls.reduce(
      (total, acao) =>
        total +
        Number(
          acao.get('valorEstimadoAcaoPrincipal')?.value ?? 0
        ),
      0
    );
  }

}
