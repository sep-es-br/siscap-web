import { AfterViewInit, Component, ElementRef, Input, NgZone, OnChanges, OnDestroy, ViewChild } from '@angular/core';
import { DragScrollDirective } from '../../../shared/directives/drag-scroll.directive';
import { FormArray, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IMoeda } from '../../../core/interfaces/moeda.interface';
import { CommonModule } from '@angular/common';
import { IOpcoesDropdown } from '../../../core/interfaces/opcoes-dropdown.interface';
import { IEstruturaCamposComplementarProjeto } from '../../../core/interfaces/estrutura.campo.complementar.dic.interface';
import { SharedModule } from 'primeng/api';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbModalModule, NgbPopoverModule, } from '@ng-bootstrap/ng-bootstrap';
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
import { NgxMaskTransformFunctionHelper } from '../../../core/helpers/ngx-mask-transform-function.helper';
import { CurrencyCaretDirective } from '../../../shared/directives/currency-caret.directive';

declare var bootstrap: any;

@Component({
  selector: 'siscap-projeto-acoes-rateio',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    NgSelectModule,
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
    CurrencyCaretDirective,
    DragScrollDirective,
    RateioAcaoLocalidadeFormComponent
  ],
  templateUrl: './projeto-acoes-rateio.component.html',
  styleUrl: './projeto-acoes-rateio.component.scss'
})
export class ProjetoAcoesRateioComponent implements OnChanges, AfterViewInit, OnDestroy {
  @ViewChild('acoesScroller') private acoesScroller?: ElementRef<HTMLElement>;
  public podeRolarEsquerda = false;
  public podeRolarDireita = false;
  public exibirSetas = false;
  private resizeObserver?: ResizeObserver;
  private mutationObserver?: MutationObserver;
  private navegacaoFrame?: number;
  private revelarAtiva = false;

  ngAfterViewInit(): void {
    const area = this.acoesScroller?.nativeElement;
    if (!area) return;
    this.resizeObserver = new ResizeObserver(() => this.agendarNavegacao());
    this.resizeObserver.observe(area);
    this.mutationObserver = new MutationObserver(() => this.agendarNavegacao(true));
    this.mutationObserver.observe(area, { childList: true });
    this.agendarNavegacao(true);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.mutationObserver?.disconnect();
    if (this.navegacaoFrame !== undefined) cancelAnimationFrame(this.navegacaoFrame);
  }

  public atualizarNavegacao(): void {
    const area = this.acoesScroller?.nativeElement;
    if (!area) return;
    const faixa = area.parentElement;
    const adicionar = faixa?.querySelector<HTMLElement>('.acao-add-tab');
    const larguraSemSetas = faixa && adicionar
      ? faixa.clientWidth - adicionar.offsetWidth - (parseFloat(getComputedStyle(faixa).columnGap) || 0)
      : area.clientWidth;
    this.exibirSetas = area.scrollWidth > larguraSemSetas + 1;
    this.podeRolarEsquerda = area.scrollLeft > 1;
    this.podeRolarDireita = area.scrollLeft + area.clientWidth < area.scrollWidth - 1;
  }

  public rolarAcoes(direcao: number): void {
    const area = this.acoesScroller?.nativeElement;
    area?.scrollBy({ left: direcao * area.clientWidth * 0.75, behavior: 'smooth' });
  }

  private agendarNavegacao(revelarAtiva = false): void {
    this.revelarAtiva ||= revelarAtiva;
    if (this.navegacaoFrame !== undefined) return;
    this.navegacaoFrame = requestAnimationFrame(() => {
      this.navegacaoFrame = undefined;
      const area = this.acoesScroller?.nativeElement;
      const ativa = area?.querySelector<HTMLElement>('.acao-tab-group.active');
      if (area && ativa && this.revelarAtiva) {
        const limite = area.getBoundingClientRect();
        const item = ativa.getBoundingClientRect();
        if (item.left < limite.left) area.scrollLeft += item.left - limite.left;
        else if (item.right > limite.right) area.scrollLeft += item.right - limite.right;
      }
      this.revelarAtiva = false;
      if (this.ngZone) this.ngZone.run(() => this.atualizarNavegacao());
      else this.atualizarNavegacao();
    });
  }
  public readonly rtlCurrencyInputTransformFn = NgxMaskTransformFunctionHelper.rtlCurrencyInputTransformFn;
  public readonly rtlCurrencyOutputTransformFn = NgxMaskTransformFunctionHelper.rtlCurrencyOutputTransformFn;

  @Input() formProjeto!: FormGroup;
  @Input() isModoEdicao: boolean = false;
  @Input() isSubcap: boolean = false;
  @Input() statusProjeto: string = '';

  @Input() moedasList: IMoeda[] = [];
  @Input() tiposValorOpcoes: IOpcoesDropdown[] = [];
  @Input() camposComplementarProjeto: IEstruturaCamposComplementarProjeto[] = [];

  acaoAtivaIndex = 0;
  public projetoAcoesListTooltip: Record<string, string> = COLECAO_TEXTO_TOOLTIP_FORMULARIO_PROJETO;

  constructor(
    private readonly acoesService: AcoesService,
    public rateioService: RateioService,
    private readonly ngZone?: NgZone
  ) { }

  ngOnChanges(): void {
    if (this.isModoEdicao && this.formProjeto?.get('acoesRateioProjeto')?.value.length === 0) {
      this.adicionarAcao();
    }
  }

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
    this.agendarNavegacao(true);
  }

  public removerAcao(index: number): void {

    const eraAcaoAtiva =
      this.acaoAtivaIndex === index;

    const acaoAtivaEstavaDepois =
      this.acaoAtivaIndex > index;

    this.acoesProjeto.removeAt(index);
    this.agendarNavegacao(true);

    if (this.acoesProjeto.length === 0) {
      this.acaoAtivaIndex = 0;
      if (this.isModoEdicao) this.adicionarAcao();
      return;
    }

    if (eraAcaoAtiva) {
      this.acaoAtivaIndex =
        Math.max(0, index - 1);

      return;
    }

    if (acaoAtivaEstavaDepois) {
      this.acaoAtivaIndex--;
    }

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
    this.agendarNavegacao(true);
  }

  // adicionarAcao(): void {

  //   const novaAcao = this.criarFormAcao();

  //   this.acoesProjeto.push(novaAcao);

  //   this.acaoAtivaIndex =
  //     this.acoesProjeto.length - 1;

  // }

}
