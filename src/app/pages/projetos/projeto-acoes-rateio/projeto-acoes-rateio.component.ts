import { Component, Input } from '@angular/core';
import { FormArray, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IMoeda } from '../../../core/interfaces/moeda.interface';
import { CommonModule } from '@angular/common';
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
import { COLECAO_TEXTO_TOOLTIP_FORMULARIO_PROJETO } from '../../../core/utils/constants';
import { AcoesService } from '../../../core/services/acoes/acoes.service';
import { RateioService } from '../../../core/services/rateio/rateio.service';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { AcaoFormType } from '../../../core/types/form/acao-form.type';
import { RateioAcaoLocalidadeFormComponent } from '../rateio-acao-localidade-form/rateio-acao-localidade-form.component';

declare var bootstrap: any;

@Component({
  selector: 'siscap-projeto-acoes-rateio',
  standalone: true,
  imports: [
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
    ReactiveFormsModule,
    NgxMaskPipe,
    NgxMaskDirective,
    RateioAcaoLocalidadeFormComponent
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

  acaoAtivaIndex = 0;

  constructor(
    private readonly acoesService: AcoesService,
    public rateioService: RateioService
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

  public get acoesProjeto(): FormArray<FormGroup<AcaoFormType>> {
    return this.formProjeto.get('acoesRateioProjeto') as FormArray<FormGroup<AcaoFormType>>;
  }

  public adicionarAcao(): void {
    this.acoesProjeto.push(
      this.acoesService.construirAcaoFormGroup()
    );
    this.acaoAtivaIndex =
      this.acoesProjeto.length - 1;
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
        ), 0
    );
  }

  public getAcaoRateioForm(
    index: number
  ): FormGroup<AcaoFormType> {
    return this.acoesProjeto.at(index);
  }

  voltarParaOds() {
    const tabTrigger = document.getElementById('nav-ods-indicadores');

    if (tabTrigger) {
      const tab = new bootstrap.Tab(tabTrigger);
      tab.show();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }

  }

  irParaPlanejamento() {

    const tabTrigger = document.getElementById('nav-planejamento');

    if (tabTrigger) {
      const tab = new bootstrap.Tab(tabTrigger);
      tab.show();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }

  }

  selecionarAcao(index: number): void {
    this.acaoAtivaIndex = index;
  }

  // adicionarAcao(): void {

  //   const novaAcao = this.criarFormAcao();

  //   this.acoesProjeto.push(novaAcao);

  //   this.acaoAtivaIndex =
  //     this.acoesProjeto.length - 1;

  // }

}
