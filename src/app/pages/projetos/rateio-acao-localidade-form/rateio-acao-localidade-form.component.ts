import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

import { startWith, Subscription } from 'rxjs';

import { RateioLocalidadeFormType } from '../../../core/types/form/rateio-form.type';
import { RateioService } from '../../../core/services/rateio/rateio.service';
import { AcaoFormType } from '../../../core/types/form/acao-form.type';
import { ILocalidadeOpcoesDropdown } from '../../../core/interfaces/opcoes-dropdown.interface';


type TipoLocalidadeView =
  | 'Estado'
  | 'Microrregiao'
  | 'Municipio';


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
  implements OnChanges, OnDestroy {

  @Input() isModoEdicao = false;

  @Input({ required: true })
  formAcao!: FormGroup<AcaoFormType>;

  @Input()
  localidadesOpcoes: Array<ILocalidadeOpcoesDropdown> = [];


  // ============================================================
  // ESTADO DA TELA
  // ============================================================

  public dropdownAberto = false;

  private _termoBusca = '';

  public get termoBusca(): string {
    return this._termoBusca;
  }

  public set termoBusca(valor: string) {
    this._termoBusca = valor ?? '';
    this.atualizarFiltroLocalidades();
  }


  // ============================================================
  // CACHE DE LOCALIDADES
  // ============================================================

  public todoEstado: LocalidadeView = {
    id: 1,
    nome: 'Todo Estado',
    tipo: 'Estado',
    idLocalidadePai: null,
  };

  public microrregioes: Array<LocalidadeView> = [];

  public municipios: Array<LocalidadeView> = [];

  public microrregioesVisiveis: Array<LocalidadeView> = [];

  public localidadesSelecionadasOrdenadas:
    Array<LocalidadeView> = [];

  public itensRateio: Array<RateioItemView> = [];

  public exibirTodoEstadoNaBusca = true;


  private todasLocalidadesView:
    Array<LocalidadeView> = [];

  private idsTodasLocalidades:
    Array<number> = [];

  private localidadesPorId =
    new Map<number, LocalidadeView>();

  private municipiosPorMicrorregiaoMap =
    new Map<number, Array<LocalidadeView>>();

  private municipiosVisiveisPorMicrorregiaoMap =
    new Map<number, Array<LocalidadeView>>();


  // ============================================================
  // SELEÇÃO
  // ============================================================

  private readonly microrregioesExpandidas =
    new Set<number>();

  private readonly localidadesSelecionadasIds =
    new Set<number>();

  private assinaturaRateios = '';


  // ============================================================
  // RESUMO DO RATEIO
  // ============================================================

  public totalPercentualDistribuido = 0;

  public totalValorDistribuido = 0;


  // ============================================================
  // FORMATADORES
  // ============================================================

  private readonly formatadorMoeda =
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    });

  private readonly formatadorPercentual =
    new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });


  // ============================================================
  // SUBSCRIPTIONS
  // ============================================================

  private formSubscription =
    new Subscription();


  constructor(
    public readonly rateioService: RateioService,
    private readonly elementRef: ElementRef<HTMLElement>,
  ) {}


  // ============================================================
  // CICLO DE VIDA
  // ============================================================

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


  // ============================================================
  // FORM
  // ============================================================

  public get rateioFormArray():
    FormArray<FormGroup<RateioLocalidadeFormType>> {

    return this.formAcao.controls.rateio;
  }


  public get valorEstimadoAcao(): number {

    return Number(
      this.formAcao
        ?.controls
        ?.valorEstimadoAcaoPrincipal
        ?.value ?? 0
    );
  }


  // ============================================================
  // INFORMAÇÕES DA SELEÇÃO
  // ============================================================

  public get quantidadeSelecionada(): number {
    return this.localidadesSelecionadasIds.size;
  }


  public get textoTrigger(): string {

    if (this.quantidadeSelecionada === 0) {
      return 'Selecione uma ou mais localidades';
    }

    if (this.quantidadeSelecionada === 1) {
      return (
        this.localidadesSelecionadasOrdenadas[0]?.nome
        ?? '1 localidade selecionada'
      );
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


  public get podeDistribuirIgualmente(): boolean {

    return (
      this.isModoEdicao &&
      this.rateioFormArray.length > 0 &&
      Number.isFinite(this.valorEstimadoAcao) &&
      this.valorEstimadoAcao > 0
    );
  }


  public get todosSelecionados(): boolean {

    return (
      this.idsTodasLocalidades.length > 0 &&
      this.idsTodasLocalidades.every(
        id => this.localidadesSelecionadasIds.has(id)
      )
    );
  }


  public get selecaoGlobalParcial(): boolean {

    const quantidadeMarcada =
      this.idsTodasLocalidades.reduce(
        (total, id) =>
          total +
          (
            this.localidadesSelecionadasIds.has(id)
              ? 1
              : 0
          ),
        0
      );

    return (
      quantidadeMarcada > 0 &&
      quantidadeMarcada < this.idsTodasLocalidades.length
    );
  }


  // ============================================================
  // DROPDOWN
  // ============================================================

  public toggleDropdown(): void {

    if (!this.isModoEdicao) {
      return;
    }

    this.dropdownAberto =
      !this.dropdownAberto;
  }


  public concluirSelecao(): void {
    this.dropdownAberto = false;
  }


  public toggleMicrorregiaoExpandida(
    idMicrorregiao: number
  ): void {

    if (
      this.microrregioesExpandidas.has(
        idMicrorregiao
      )
    ) {

      this.microrregioesExpandidas.delete(
        idMicrorregiao
      );

      return;
    }

    this.microrregioesExpandidas.add(
      idMicrorregiao
    );
  }


  public isMicrorregiaoExpandida(
    idMicrorregiao: number
  ): boolean {

    return (
      !!this.termoBusca.trim() ||
      this.microrregioesExpandidas.has(
        idMicrorregiao
      )
    );
  }


  // ============================================================
  // MUNICÍPIOS POR MICRORREGIÃO
  // ============================================================

  public municipiosPorMicrorregiao(
    idMicrorregiao: number
  ): Array<LocalidadeView> {

    return (
      this.municipiosVisiveisPorMicrorregiaoMap
        .get(idMicrorregiao)
      ?? []
    );
  }


  public todosMunicipiosMicrorregiaoSelecionados(
    idMicrorregiao: number
  ): boolean {

    const municipios =
      this.municipiosPorMicrorregiaoMap
        .get(idMicrorregiao)
      ?? [];

    return (
      municipios.length > 0 &&
      municipios.every(
        municipio =>
          this.localidadesSelecionadasIds.has(
            municipio.id
          )
      )
    );
  }


  public selecaoMicrorregiaoParcial(
    idMicrorregiao: number
  ): boolean {

    const municipios =
      this.municipiosPorMicrorregiaoMap
        .get(idMicrorregiao)
      ?? [];

    const quantidadeMarcada =
      municipios.reduce(
        (total, municipio) =>
          total +
          (
            this.localidadesSelecionadasIds.has(
              municipio.id
            )
              ? 1
              : 0
          ),
        0
      );

    return (
      quantidadeMarcada > 0 &&
      quantidadeMarcada < municipios.length
    );
  }


  // ============================================================
  // SELEÇÃO DE LOCALIDADES
  // ============================================================

  public isLocalidadeSelecionada(
    idLocalidade: number
  ): boolean {

    return this.localidadesSelecionadasIds.has(
      idLocalidade
    );
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
      this.idsTodasLocalidades,
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

    const idsMunicipios =
      (
        this.municipiosPorMicrorregiaoMap
          .get(idMicrorregiao)
        ?? []
      )
        .map(item => item.id);

    this.aplicarSelecaoEmLote(
      idsMunicipios,
      checked
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


  // ============================================================
  // DISTRIBUIÇÃO
  // ============================================================

  public distribuirIgualmente(): void {

    if (!this.podeDistribuirIgualmente) {
      return;
    }

    const controles =
      this.rateioFormArray.controls;

    const quantidade =
      controles.length;

    const totalCentavos =
      Math.round(
        this.valorEstimadoAcao * 100
      );

    const valorBaseCentavos =
      Math.floor(
        totalCentavos / quantidade
      );

    const percentualBase =
      Math.floor(
        10000 / quantidade
      ) / 100;

    controles.forEach(
      (control, index) => {

        const ultimo =
          index === quantidade - 1;

        const valorCentavos =
          ultimo
            ? (
              totalCentavos -
              valorBaseCentavos *
              (quantidade - 1)
            )
            : valorBaseCentavos;

        const percentual =
          ultimo
            ? this.arredondar2(
              100 -
              percentualBase *
              (quantidade - 1)
            )
            : percentualBase;

        control.patchValue(
          {
            quantia:
              valorCentavos / 100,
            percentual,
          },
          {
            emitEvent: false,
          }
        );
      }
    );

    /*
     * Os 78 controles, por exemplo, são alterados
     * sem gerar 78 valueChanges.
     *
     * Ao final emitimos uma única atualização.
     */
    this.rateioFormArray
      .updateValueAndValidity({
        emitEvent: true,
      });

    this.atualizarResumoRateio();
  }


  public zerarValores(): void {

    if (!this.isModoEdicao) {
      return;
    }

    this.rateioFormArray
      .controls
      .forEach(control => {

        control.patchValue(
          {
            percentual: 0,
            quantia: 0,
          },
          {
            emitEvent: false,
          }
        );
      });

    this.rateioFormArray
      .updateValueAndValidity({
        emitEvent: true,
      });

    this.atualizarResumoRateio();
  }


  public percentualAlterado(
    control: FormGroup<RateioLocalidadeFormType>
  ): void {

    if (!this.isModoEdicao) {
      return;
    }

    const percentual =
      Number(
        control.controls.percentual.value
        ?? 0
      );

    const quantia =
      this.valorEstimadoAcao > 0
        ? this.arredondar2(
          this.valorEstimadoAcao *
          percentual /
          100
        )
        : 0;

    control.controls.quantia
      .setValue(quantia);
  }


  public quantiaAlterada(
    control: FormGroup<RateioLocalidadeFormType>
  ): void {

    if (!this.isModoEdicao) {
      return;
    }

    const quantia =
      Number(
        control.controls.quantia.value
        ?? 0
      );

    const percentual =
      this.valorEstimadoAcao > 0
        ? this.arredondar2(
          quantia *
          100 /
          this.valorEstimadoAcao
        )
        : 0;

    control.controls.percentual
      .setValue(percentual);
  }


  // ============================================================
  // FORMATAÇÃO
  // ============================================================

  public formatarMoeda(
    valor: number
  ): string {

    return this.formatadorMoeda
      .format(valor || 0);
  }


  public formatarPercentual(
    valor: number
  ): string {

    return `${
      this.formatadorPercentual
        .format(valor || 0)
    }%`;
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


  // ============================================================
  // TRACK BY
  // ============================================================

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


  // ============================================================
  // CLIQUE FORA
  // ============================================================

  @HostListener(
    'document:click',
    ['$event']
  )
  public fecharDropdownAoClicarFora(
    event: MouseEvent
  ): void {

    const target =
      event.target as Node | null;

    if (
      target &&
      !this.elementRef
        .nativeElement
        .contains(target)
    ) {
      this.dropdownAberto = false;
    }
  }


  // ============================================================
  // INPUT DE QUANTIA
  // ============================================================

  public focarQuantia(
    event: FocusEvent,
    valor: number | null
  ): void {

    const input =
      event.target as HTMLInputElement;

    input.value =
      Number(valor ?? 0)
        .toLocaleString(
          'pt-BR',
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        );
  }


  public atualizarQuantia(
    event: FocusEvent,
    control: FormControl<number | null>
  ): void {

    const input =
      event.target as HTMLInputElement;

    const valorNumerico =
      Number(
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

    input.value =
      this.formatarMoeda(
        control.value ?? 0
      );
  }


  // ============================================================
  // VALIDAÇÃO VISUAL DO RATEIO
  // ============================================================

  public get valorRateioValido(): boolean {

    const valorEstimadoCentavos =
      Math.round(
        this.valorEstimadoAcao * 100
      );

    const valorDistribuidoCentavos =
      Math.round(
        this.totalValorDistribuido * 100
      );

    return (
      valorEstimadoCentavos ===
      valorDistribuidoCentavos
    );
  }


  public get percentualRateioValido(): boolean {

    const percentual =
      Math.round(
        this.totalPercentualDistribuido * 100
      );

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
      this.totalPercentualDistribuido -
      100
    );
  }


  // ============================================================
  // INICIALIZAÇÃO
  // ============================================================

  private inicializarComponente(): void {

    if (
      !this.formAcao ||
      !this.formAcao.controls?.rateio
    ) {
      return;
    }

    /*
     * Primeiro gera as estruturas cacheadas.
     * Isso evita reconstruí-las durante o
     * change detection do Angular.
     */
    this.montarCacheLocalidades();

    this.rateioService.localidadesOpcoes =
      this.localidadesOpcoes;

    this.rateioService
      .vincularRateioFormArray(
        this.formAcao.controls.rateio
      );

    this.formSubscription.unsubscribe();

    this.formSubscription =
      new Subscription();

    /*
     * Valor estimado da ação.
     */
    this.formSubscription.add(

      this.formAcao
        .controls
        .valorEstimadoAcaoPrincipal
        .valueChanges
        .pipe(
          startWith(
            this.formAcao
              .controls
              .valorEstimadoAcaoPrincipal
              .value
          )
        )
        .subscribe(valor => {

          this.rateioService
            .quantiaFormControlReferencia$
            .next(
              Number(valor ?? 0)
            );

          this.atualizarResumoRateio();
        })
    );

    /*
     * Alterações no FormArray.
     */
    this.formSubscription.add(

      this.rateioFormArray
        .valueChanges
        .pipe(
          startWith(
            this.rateioFormArray
              .getRawValue()
          )
        )
        .subscribe(() => {

          this.atualizarEstruturasRateio();

          this.atualizarResumoRateio();
        })
    );

    /*
     * Estado inicial.
     */
    this.atualizarEstruturasRateio(true);

    this.atualizarResumoRateio();

    this.atualizarFiltroLocalidades();
  }


  // ============================================================
  // CACHE DAS LOCALIDADES
  // ============================================================

  private montarCacheLocalidades(): void {

    const estadoEncontrado =
      this.localidadesOpcoes.find(
        localidade =>
          localidade.id === 1
      );

    this.todoEstado = {
      id: 1,
      nome:
        estadoEncontrado?.nome
        ?? 'Todo Estado',
      tipo: 'Estado',
      idLocalidadePai: null,
    };

    this.microrregioes =
      this.localidadesOpcoes
        .filter(
          localidade =>
            localidade.tipo ===
            'Microrregiao'
        )
        .map(
          localidade =>
            this.mapearLocalidade(
              localidade
            )
        )
        .sort(
          (a, b) =>
            this.ordenarLocalidadesPorNome(
              a,
              b
            )
        );

    this.municipios =
      this.localidadesOpcoes
        .filter(
          localidade =>
            localidade.tipo ===
            'Municipio'
        )
        .map(
          localidade =>
            this.mapearLocalidade(
              localidade
            )
        )
        .sort(
          (a, b) =>
            this.ordenarLocalidadesPorNome(
              a,
              b
            )
        );

    this.todasLocalidadesView = [
      this.todoEstado,
      ...this.microrregioes,
      ...this.municipios,
    ];

    this.idsTodasLocalidades =
      this.todasLocalidadesView
        .map(localidade => localidade.id);

    /*
     * Busca O(1) por id.
     */
    this.localidadesPorId =
      new Map(
        this.todasLocalidadesView
          .map(localidade => [
            localidade.id,
            localidade,
          ])
      );

    /*
     * Municípios agrupados por microrregião.
     */
    this.municipiosPorMicrorregiaoMap.clear();

    this.municipios.forEach(
      municipio => {

        const idMicrorregiao =
          municipio.idLocalidadePai;

        if (idMicrorregiao == null) {
          return;
        }

        const municipios =
          this.municipiosPorMicrorregiaoMap
            .get(idMicrorregiao)
          ?? [];

        municipios.push(municipio);

        this.municipiosPorMicrorregiaoMap
          .set(
            idMicrorregiao,
            municipios
          );
      }
    );

    this.atualizarFiltroLocalidades();
  }


  // ============================================================
  // FILTRO
  // ============================================================

  private atualizarFiltroLocalidades(): void {

    const termo =
      this.normalizarTexto(
        this.termoBusca
      );

    this.exibirTodoEstadoNaBusca =
      !termo ||
      this.normalizarTexto(
        this.todoEstado.nome
      )
        .includes(termo);

    this.municipiosVisiveisPorMicrorregiaoMap
      .clear();

    if (!termo) {

      this.microrregioesVisiveis =
        this.microrregioes;

      this.microrregioes.forEach(
        microrregiao => {

          this.municipiosVisiveisPorMicrorregiaoMap
            .set(
              microrregiao.id,
              this.municipiosPorMicrorregiaoMap
                .get(microrregiao.id)
              ?? []
            );
        }
      );

      return;
    }

    this.microrregioesVisiveis =
      this.microrregioes.filter(
        microrregiao => {

          const nomeMicrorregiao =
            this.normalizarTexto(
              microrregiao.nome
            );

          const municipios =
            this.municipiosPorMicrorregiaoMap
              .get(microrregiao.id)
            ?? [];

          /*
           * Se a própria microrregião corresponde
           * à busca, exibe todos os municípios.
           */
          if (
            nomeMicrorregiao.includes(
              termo
            )
          ) {

            this.municipiosVisiveisPorMicrorregiaoMap
              .set(
                microrregiao.id,
                municipios
              );

            return true;
          }

          /*
           * Caso contrário mostra somente
           * municípios correspondentes.
           */
          const municipiosFiltrados =
            municipios.filter(
              municipio =>
                this.normalizarTexto(
                  municipio.nome
                )
                  .includes(termo)
            );

          if (
            municipiosFiltrados.length > 0
          ) {

            this.municipiosVisiveisPorMicrorregiaoMap
              .set(
                microrregiao.id,
                municipiosFiltrados
              );

            return true;
          }

          return false;
        }
      );
  }


  // ============================================================
  // ESTRUTURAS DO RATEIO
  // ============================================================

  private atualizarEstruturasRateio(
    forcar = false
  ): void {

    /*
     * Percentual/quantia mudam o valueChanges
     * do FormArray, porém NÃO alteram os itens
     * que precisam aparecer na lista.
     *
     * Portanto usamos somente os ids para
     * descobrir se houve alteração estrutural.
     */
    const assinaturaAtual =
      this.rateioFormArray
        .controls
        .map(
          control =>
            control.controls
              .idLocalidade
              .value
        )
        .join('|');

    if (
      !forcar &&
      assinaturaAtual ===
      this.assinaturaRateios
    ) {
      return;
    }

    this.assinaturaRateios =
      assinaturaAtual;

    this.sincronizarSelecionadasComFormArray();

    this.atualizarItensRateio();

    this.atualizarLocalidadesSelecionadasOrdenadas();
  }


  private sincronizarSelecionadasComFormArray(): void {

    this.localidadesSelecionadasIds
      .clear();

    this.rateioFormArray
      .controls
      .forEach(control => {

        const idLocalidade =
          control.controls
            .idLocalidade
            .value;

        this.localidadesSelecionadasIds
          .add(idLocalidade);
      });
  }


  private atualizarItensRateio(): void {

    this.itensRateio =
      this.rateioFormArray
        .controls
        .map(control => {

          const idLocalidade =
            control.controls
              .idLocalidade
              .value;

          return {
            control,
            localidade:
              this.buscarLocalidadeView(
                idLocalidade
              )
              ?? {
                id: idLocalidade,
                nome:
                  `Localidade ${idLocalidade}`,
                tipo:
                  'Municipio' as const,
                idLocalidadePai: null,
              },
          };
        })
        .sort(
          (a, b) =>
            this.ordenarLocalidadesRateio(
              a.localidade,
              b.localidade
            )
        );
  }


  private atualizarLocalidadesSelecionadasOrdenadas(): void {

    this.localidadesSelecionadasOrdenadas =
      this.todasLocalidadesView
        .filter(
          localidade =>
            this.localidadesSelecionadasIds
              .has(localidade.id)
        )
        .sort(
          (a, b) =>
            this.ordenarLocalidadesRateio(
              a,
              b
            )
        );
  }


  private atualizarResumoRateio(): void {

    let totalPercentual = 0;
    let totalValor = 0;

    this.rateioFormArray
      .controls
      .forEach(control => {

        totalPercentual +=
          Number(
            control.controls
              .percentual
              .value
            ?? 0
          );

        totalValor +=
          Number(
            control.controls
              .quantia
              .value
            ?? 0
          );
      });

    this.totalPercentualDistribuido =
      totalPercentual;

    this.totalValorDistribuido =
      totalValor;
  }


  // ============================================================
  // MANIPULAÇÃO DE LOCALIDADES
  // ============================================================

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
      .incluirLocalidadeNoRateio(
        control
      );
  }


  private removerLocalidade(
    idLocalidade: number
  ): void {

    this.rateioService
      .removerLocalidadeDoRateio(
        idLocalidade
      );
  }


  private aplicarSelecaoEmLote(
    idsLocalidades: Array<number>,
    selecionar: boolean
  ): void {

    idsLocalidades.forEach(
      idLocalidade => {

        selecionar
          ? this.incluirLocalidade(
            idLocalidade
          )
          : this.removerLocalidade(
            idLocalidade
          );
      }
    );
  }


  // ============================================================
  // HELPERS
  // ============================================================

  private buscarLocalidadeView(
    idLocalidade: number
  ): LocalidadeView | undefined {

    return this.localidadesPorId
      .get(idLocalidade);
  }


  private mapearLocalidade(
    localidade: ILocalidadeOpcoesDropdown
  ): LocalidadeView {

    return {
      id: localidade.id,
      nome: localidade.nome,
      tipo:
        localidade.tipo as TipoLocalidadeView,
      idLocalidadePai:
        localidade.idLocalidadePai
        ?? null,
    };

  }


  private ordenarLocalidadesPorNome(
    a: LocalidadeView,
    b: LocalidadeView
  ): number {

    return a.nome.localeCompare(
      b.nome,
      'pt-BR',
      {
        sensitivity: 'base',
      }
    );
  }


  private ordenarLocalidadesRateio(
    a: LocalidadeView,
    b: LocalidadeView
  ): number {

    const ordemTipo:
      Record<TipoLocalidadeView, number> = {

        Estado: 0,
        Microrregiao: 1,
        Municipio: 2,
      };

    const diferencaTipo =
      ordemTipo[a.tipo] -
      ordemTipo[b.tipo];

    if (diferencaTipo !== 0) {
      return diferencaTipo;
    }

    return this.ordenarLocalidadesPorNome(
      a,
      b
    );
  }


  private normalizarTexto(
    texto: string
  ): string {

    return (texto ?? '')
      .normalize('NFD')
      .replace(
        /[\u0300-\u036f]/g,
        ''
      )
      .toLowerCase()
      .trim();
  }


  private arredondar2(
    valor: number
  ): number {

    return (
      Math.round(
        (
          valor +
          Number.EPSILON
        ) * 100
      ) / 100
    );
  }

}