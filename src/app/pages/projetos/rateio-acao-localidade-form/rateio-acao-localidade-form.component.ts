import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule } from '@angular/forms';
import {
  FormArray,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { startWith, Subscription } from 'rxjs';
import { RateioLocalidadeFormType } from '../../../core/types/form/rateio-form.type';
import { RateioService } from '../../../core/services/rateio/rateio.service';
import { AcaoFormType } from '../../../core/types/form/acao-form.type';
import { ILocalidadeOpcoesDropdown } from '../../../core/interfaces/opcoes-dropdown.interface';

type TipoLocalidadeView = 'Estado' | 'Microrregiao' | 'Municipio';

interface LocalidadeView {
  id: number;
  nome: string;
  tipo: TipoLocalidadeView;
  idLocalidadePai: number | null;
}

interface RateioItemView {
  localidade: LocalidadeView;
  control: FormGroup<RateioLocalidadeFormType>;
}

@Component({
  selector: 'app-rateio-acao-localidade-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './rateio-acao-localidade-form.component.html',
  styleUrl: './rateio-acao-localidade-form.component.scss',
  providers: [RateioService],
})
export class RateioAcaoLocalidadeFormComponent
  implements OnInit, OnChanges, OnDestroy {

  /*
   * Mantidos os mesmos inputs do componente de rateio atual.
   * Assim o componente novo continua recebendo a ação e as localidades
   * sem alterar o contrato do formulário pai.
   */
  @Input() isModoEdicao = false;

  @Input({ required: true })
  formAcao!: FormGroup<AcaoFormType>;

  @Input()
  localidadesOpcoes: Array<ILocalidadeOpcoesDropdown> = [];

  public dropdownAberto = false;
  public termoBusca = '';

  private readonly microrregioesExpandidas = new Set<number>();
  private readonly localidadesSelecionadasIds = new Set<number>();

  private formSubscription = new Subscription();

  constructor(
    public readonly rateioService: RateioService,
    private readonly elementRef: ElementRef<HTMLElement>,
  ) {}

  ngOnInit(): void {
    this.inicializarComponente();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['formAcao'] ||
      changes['localidadesOpcoes']
    ) {
      this.inicializarComponente();
    }
  }

  ngOnDestroy(): void {
    this.formSubscription.unsubscribe();
  }

  public get rateioFormArray():
    FormArray<FormGroup<RateioLocalidadeFormType>> {

    return this.formAcao.controls.rateio;
  }

  public get valorEstimadoAcao(): number {
    return Number(
      this.formAcao?.controls
        ?.valorEstimadoAcaoPrincipal
        ?.value ?? 0
    );
  }

  public get todoEstado(): LocalidadeView {
    const estadoEncontrado =
      this.localidadesOpcoes.find(
        localidade => localidade.id === 1
      );

    return {
      id: 1,
      nome: estadoEncontrado?.nome ?? 'Todo Estado',
      tipo: 'Estado',
      idLocalidadePai: null,
    };
  }

  public get microrregioes(): Array<LocalidadeView> {
    return this.localidadesOpcoes
      .filter(localidade => localidade.tipo === 'Microrregiao')
      .map(localidade => this.mapearLocalidade(localidade))
      .sort(this.ordenarLocalidadesPorNome);
  }

  public get municipios(): Array<LocalidadeView> {
    return this.localidadesOpcoes
      .filter(localidade => localidade.tipo === 'Municipio')
      .map(localidade => this.mapearLocalidade(localidade))
      .sort(this.ordenarLocalidadesPorNome);
  }

  public get microrregioesVisiveis(): Array<LocalidadeView> {
    const termo = this.normalizarTexto(this.termoBusca);

    if (!termo) {
      return this.microrregioes;
    }

    return this.microrregioes.filter(microrregiao => {
      const microCorresponde =
        this.normalizarTexto(microrregiao.nome).includes(termo);

      const algumMunicipioCorresponde =
        this.municipiosPorMicrorregiao(microrregiao.id)
          .some(municipio =>
            this.normalizarTexto(municipio.nome).includes(termo)
          );

      return microCorresponde || algumMunicipioCorresponde;
    });
  }

  public get exibirTodoEstadoNaBusca(): boolean {
    const termo = this.normalizarTexto(this.termoBusca);

    return (
      !termo ||
      this.normalizarTexto(this.todoEstado.nome).includes(termo)
    );
  }

  public get quantidadeSelecionada(): number {
    return this.localidadesSelecionadasIds.size;
  }

  public get textoTrigger(): string {
    if (this.quantidadeSelecionada === 0) {
      return 'Selecione uma ou mais localidades';
    }

    if (this.quantidadeSelecionada === 1) {
      return this.localidadesSelecionadasOrdenadas[0]?.nome
        ?? '1 localidade selecionada';
    }

    return `${this.quantidadeSelecionada} localidades selecionadas`;
  }

  public get textoRodapeSelecao(): string {
    if (this.quantidadeSelecionada === 0) {
      return 'Nenhuma localidade selecionada';
    }

    if (this.quantidadeSelecionada === 1) {
      return '1 localidade selecionada';
    }

    return `${this.quantidadeSelecionada} localidades selecionadas`;
  }

  public get localidadesSelecionadasOrdenadas(): Array<LocalidadeView> {
    return this.todasLocalidadesView
      .filter(localidade =>
        this.localidadesSelecionadasIds.has(localidade.id)
      )
      .sort((a, b) => this.ordenarLocalidadesRateio(a, b));
  }

  public get itensRateio(): Array<RateioItemView> {
    return this.rateioFormArray.controls
      .map(control => {
        const idLocalidade =
          control.controls.idLocalidade.value;

        return {
          control,
          localidade:
            this.buscarLocalidadeView(idLocalidade) ?? {
              id: idLocalidade,
              nome: `Localidade ${idLocalidade}`,
              tipo: 'Municipio' as const,
              idLocalidadePai: null,
            },
        };
      })
      .sort((a, b) =>
        this.ordenarLocalidadesRateio(
          a.localidade,
          b.localidade
        )
      );
  }

  public get totalPercentualDistribuido(): number {
    return this.rateioFormArray.controls.reduce(
      (total, control) =>
        total + Number(control.controls.percentual.value ?? 0),
      0
    );
  }

  public get totalValorDistribuido(): number {
    return this.rateioFormArray.controls.reduce(
      (total, control) =>
        total + Number(control.controls.quantia.value ?? 0),
      0
    );
  }

  public get podeDistribuirIgualmente(): boolean {
    return (
      this.isModoEdicao &&
      this.rateioFormArray.length > 0 &&
      Number.isFinite(this.valorEstimadoAcao) &&
      this.valorEstimadoAcao > 0
    );
  }

  public get todosSelecionados(): boolean {
    const ids = this.todasLocalidadesView.map(item => item.id);

    return (
      ids.length > 0 &&
      ids.every(id => this.isLocalidadeSelecionada(id))
    );
  }

  public get selecaoGlobalParcial(): boolean {
    const ids = this.todasLocalidadesView.map(item => item.id);
    const quantidadeMarcada =
      ids.filter(id => this.isLocalidadeSelecionada(id)).length;

    return (
      quantidadeMarcada > 0 &&
      quantidadeMarcada < ids.length
    );
  }

  public toggleDropdown(): void {
    if (!this.isModoEdicao) {
      return;
    }

    this.dropdownAberto = !this.dropdownAberto;
  }

  public concluirSelecao(): void {
    this.dropdownAberto = false;
  }

  public toggleMicrorregiaoExpandida(
    idMicrorregiao: number
  ): void {

    if (this.microrregioesExpandidas.has(idMicrorregiao)) {
      this.microrregioesExpandidas.delete(idMicrorregiao);
      return;
    }

    this.microrregioesExpandidas.add(idMicrorregiao);
  }

  public isMicrorregiaoExpandida(
    idMicrorregiao: number
  ): boolean {

    return (
      !!this.termoBusca.trim() ||
      this.microrregioesExpandidas.has(idMicrorregiao)
    );
  }

  public municipiosPorMicrorregiao(
    idMicrorregiao: number
  ): Array<LocalidadeView> {

    const municipios =
      this.municipios.filter(
        municipio =>
          municipio.idLocalidadePai === idMicrorregiao
      );

    const termo = this.normalizarTexto(this.termoBusca);

    if (!termo) {
      return municipios;
    }

    const microrregiao =
      this.microrregioes.find(
        item => item.id === idMicrorregiao
      );

    if (
      microrregiao &&
      this.normalizarTexto(microrregiao.nome).includes(termo)
    ) {
      return municipios;
    }

    return municipios.filter(municipio =>
      this.normalizarTexto(municipio.nome).includes(termo)
    );
  }

  public isLocalidadeSelecionada(
    idLocalidade: number
  ): boolean {

    return this.localidadesSelecionadasIds.has(idLocalidade);
  }

  public toggleLocalidade(
    localidade: LocalidadeView,
    checked: boolean
  ): void {

    if (!this.isModoEdicao) {
      return;
    }

    checked
      ? this.incluirLocalidade(localidade.id)
      : this.removerLocalidade(localidade.id);
  }

  public toggleSelecionarTodos(
    checked: boolean
  ): void {

    if (!this.isModoEdicao) {
      return;
    }

    this.aplicarSelecaoEmLote(
      this.todasLocalidadesView.map(item => item.id),
      checked
    );
  }

  public toggleSelecionarTodosMicrorregiao(
    idMicrorregiao: number,
    checked: boolean
  ): void {

    if (!this.isModoEdicao) {
      return;
    }

    /*
     * O "Selecionar todos" dentro da microrregião é facilitador
     * apenas para os municípios filhos.
     *
     * A própria microrregião continua independente, exatamente
     * como definido no template.
     */
    const idsMunicipios =
      this.municipiosPorMicrorregiao(idMicrorregiao)
        .map(item => item.id);

    this.aplicarSelecaoEmLote(
      idsMunicipios,
      checked
    );
  }

  public todosMunicipiosMicrorregiaoSelecionados(
    idMicrorregiao: number
  ): boolean {

    const ids =
      this.municipiosPorMicrorregiao(idMicrorregiao)
        .map(item => item.id);

    return (
      ids.length > 0 &&
      ids.every(id => this.isLocalidadeSelecionada(id))
    );
  }

  public selecaoMicrorregiaoParcial(
    idMicrorregiao: number
  ): boolean {

    const ids =
      this.municipiosPorMicrorregiao(idMicrorregiao)
        .map(item => item.id);

    const quantidadeMarcada =
      ids.filter(id => this.isLocalidadeSelecionada(id)).length;

    return (
      quantidadeMarcada > 0 &&
      quantidadeMarcada < ids.length
    );
  }

  public removerLocalidadeSelecionada(
    idLocalidade: number
  ): void {

    if (!this.isModoEdicao) {
      return;
    }

    this.removerLocalidade(idLocalidade);
  }

  public distribuirIgualmente(): void {
    if (!this.podeDistribuirIgualmente) {
      return;
    }

    const controles = this.rateioFormArray.controls;
    const quantidade = controles.length;

    /*
     * Distribuição monetária em centavos para evitar perda
     * por ponto flutuante. A última localidade recebe a diferença.
     */
    const totalCentavos =
      Math.round(this.valorEstimadoAcao * 100);

    const valorBaseCentavos =
      Math.floor(totalCentavos / quantidade);

    const percentualBase =
      Math.floor((10000 / quantidade)) / 100;

    controles.forEach((control, index) => {
      const ultimo = index === quantidade - 1;

      const valorCentavos = ultimo
        ? totalCentavos -
          valorBaseCentavos * (quantidade - 1)
        : valorBaseCentavos;

      const percentual = ultimo
        ? this.arredondar2(
            100 -
            percentualBase * (quantidade - 1)
          )
        : percentualBase;

      control.patchValue({
        quantia: valorCentavos / 100,
        percentual,
      });
    });
  }

  public zerarValores(): void {
    if (!this.isModoEdicao) {
      return;
    }

    this.rateioFormArray.controls.forEach(control => {
      control.patchValue({
        percentual: 0,
        quantia: 0,
      });
    });
  }

  public percentualAlterado(
    control: FormGroup<RateioLocalidadeFormType>
  ): void {

    if (!this.isModoEdicao) {
      return;
    }

    const percentual =
      Number(control.controls.percentual.value ?? 0);

    const quantia =
      this.valorEstimadoAcao > 0
        ? this.arredondar2(
            this.valorEstimadoAcao * percentual / 100
          )
        : 0;

    control.controls.quantia.setValue(quantia);
  }

  public quantiaAlterada(
    control: FormGroup<RateioLocalidadeFormType>
  ): void {

    if (!this.isModoEdicao) {
      return;
    }

    const quantia =
      Number(control.controls.quantia.value ?? 0);

    const percentual =
      this.valorEstimadoAcao > 0
        ? this.arredondar2(
            quantia * 100 / this.valorEstimadoAcao
          )
        : 0;

    control.controls.percentual.setValue(percentual);
  }

  public formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(valor || 0);
  }

  public formatarPercentual(valor: number): string {
    return `${new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(valor || 0)}%`;
  }

  public tipoLocalidadeLabel(
    tipo: TipoLocalidadeView
  ): string {

    switch (tipo) {
      case 'Estado':
        return 'Estado';
      case 'Microrregiao':
        return 'Microregião';
      case 'Municipio':
        return 'Município';
    }
  }

  public trackByLocalidade(
    _: number,
    localidade: LocalidadeView
  ): number {
    return localidade.id;
  }

  public trackByRateio(
    _: number,
    item: RateioItemView
  ): number {
    return item.localidade.id;
  }

  @HostListener('document:click', ['$event'])
  public fecharDropdownAoClicarFora(
    event: MouseEvent
  ): void {

    const target = event.target as Node | null;

    if (
      target &&
      !this.elementRef.nativeElement.contains(target)
    ) {
      this.dropdownAberto = false;
    }
  }

  private inicializarComponente(): void {
    if (
      !this.formAcao ||
      !this.formAcao.controls?.rateio
    ) {
      return;
    }

    this.rateioService.localidadesOpcoes =
      this.localidadesOpcoes;

    this.rateioService.vincularRateioFormArray(
      this.formAcao.controls.rateio
    );

    this.formSubscription.unsubscribe();
    this.formSubscription = new Subscription();

    this.formSubscription.add(
      this.formAcao.controls
        .valorEstimadoAcaoPrincipal
        .valueChanges
        .pipe(
          startWith(
            this.formAcao.controls
              .valorEstimadoAcaoPrincipal
              .value
          )
        )
        .subscribe(valor => {
          this.rateioService
            .quantiaFormControlReferencia$
            .next(Number(valor ?? 0));
        })
    );

    this.formSubscription.add(
      this.rateioFormArray.valueChanges
        .pipe(
          startWith(this.rateioFormArray.getRawValue())
        )
        .subscribe(() =>
          this.sincronizarSelecionadasComFormArray()
        )
    );

    this.sincronizarSelecionadasComFormArray();
  }

  private get todasLocalidadesView():
    Array<LocalidadeView> {

    return [
      this.todoEstado,
      ...this.microrregioes,
      ...this.municipios,
    ];
  }

  private incluirLocalidade(
    idLocalidade: number
  ): void {

    if (
      this.rateioService
        .buscarIndiceControleRateioLocalidadeFormGroup(
          idLocalidade
        ) >= 0
    ) {
      return;
    }

    const control =
      this.rateioService
        .construirRateioLocalidadeFormGroupPorIdLocalidade(
          idLocalidade
        );

    this.rateioService
      .incluirLocalidadeNoRateio(control);
  }

  private removerLocalidade(
    idLocalidade: number
  ): void {

    this.rateioService
      .removerLocalidadeDoRateio(idLocalidade);
  }

  private aplicarSelecaoEmLote(
    idsLocalidades: Array<number>,
    selecionar: boolean
  ): void {

    idsLocalidades.forEach(idLocalidade => {
      selecionar
        ? this.incluirLocalidade(idLocalidade)
        : this.removerLocalidade(idLocalidade);
    });
  }

  private sincronizarSelecionadasComFormArray(): void {
    this.localidadesSelecionadasIds.clear();

    this.rateioFormArray.controls.forEach(control => {
      const idLocalidade =
        control.controls.idLocalidade.value;

      this.localidadesSelecionadasIds.add(idLocalidade);
    });
  }

  private buscarLocalidadeView(
    idLocalidade: number
  ): LocalidadeView | undefined {

    return this.todasLocalidadesView.find(
      localidade => localidade.id === idLocalidade
    );
  }

  private mapearLocalidade(
    localidade: ILocalidadeOpcoesDropdown
  ): LocalidadeView {

    return {
      id: localidade.id,
      nome: localidade.nome,
      tipo: localidade.tipo as TipoLocalidadeView,
      idLocalidadePai:
        localidade.idLocalidadePai ?? null,
    };
  }

  private ordenarLocalidadesPorNome(
    a: LocalidadeView,
    b: LocalidadeView
  ): number {

    return a.nome.localeCompare(
      b.nome,
      'pt-BR',
      { sensitivity: 'base' }
    );
  }

  private ordenarLocalidadesRateio(
    a: LocalidadeView,
    b: LocalidadeView
  ): number {

    const ordemTipo: Record<TipoLocalidadeView, number> = {
      Estado: 0,
      Microrregiao: 1,
      Municipio: 2,
    };

    const diferencaTipo =
      ordemTipo[a.tipo] - ordemTipo[b.tipo];

    if (diferencaTipo !== 0) {
      return diferencaTipo;
    }

    return this.ordenarLocalidadesPorNome(a, b);
  }

  private normalizarTexto(texto: string): string {
    return (texto ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  private arredondar2(valor: number): number {
    return Math.round((valor + Number.EPSILON) * 100) / 100;
  }

  public focarQuantia(event: FocusEvent, valor: number | null): void {
    const input = event.target as HTMLInputElement;
  
    input.value = Number(valor ?? 0).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  public atualizarQuantia(
    event: FocusEvent,
    control: FormControl<number | null>
  ): void {
  
    const input = event.target as HTMLInputElement;
  
    const valorNumerico = Number(
      input.value
        .replace(/\./g, '')
        .replace(',', '.')
        .replace(/[^\d.-]/g, '')
    );
  
    control.setValue(
      Number.isFinite(valorNumerico)
        ? valorNumerico
        : 0
    );
  
    control.markAsDirty();
    control.markAsTouched();
  
    input.value = this.formatarMoeda(control.value ?? 0);
  }

  public get valorRateioValido(): boolean {

    const valorEstimadoCentavos =
      Math.round(this.valorEstimadoAcao * 100);
  
    const valorDistribuidoCentavos =
      Math.round(this.totalValorDistribuido * 100);
  
    return valorEstimadoCentavos === valorDistribuidoCentavos;
  }
  
  public get percentualRateioValido(): boolean {
  
    const percentual =
      Math.round(this.totalPercentualDistribuido * 100);
  
    return percentual === 10000;
  }
  
  public get rateioValido(): boolean {
    return (
      this.valorRateioValido &&
      this.percentualRateioValido
    );
  }

  public get diferencaValorRateio(): number {
    return this.arredondar2(
      this.totalValorDistribuido -
      this.valorEstimadoAcao
    );
  }
  
  public get diferencaPercentualRateio(): number {
    return this.arredondar2(
      this.totalPercentualDistribuido - 100
    );
  }

}
