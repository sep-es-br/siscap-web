import { Component, DestroyRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FiltroIndicadoresComponent } from './filtro-indicadores/filtro-indicadores.component';
import { SelecaoIndicadoresComponent } from './selecao-indicadores/selecao-indicadores.component';
import { CatalogoIndicadorService } from '../../core/services/catalogo-indicadores/catalogo-indicador.service';
import { switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IFiltroIndicador, IGestoesCatalogoExterno, IIndicadoresCatalogoExterno, IMetaIndicador } from '../../core/interfaces/indicadores-catalogo-externo.interface';
import { StatusProjetoEnum } from '../../core/enums/status-projeto.enum';
import { ToastService } from '../../core/services/toast/toast.service';
import { TemplatesModule } from '../../shared/templates/templates.module';
import { FilterCardComponent } from '../../shared/components/filter-card/filter-card.component';
import { FilterChip } from '../../shared/components/filter-card/filter-chip.interface';

export interface IndicadorProjetoForm {
  idIndicador: number;
  tipoIndicador: number;
  descricaoIndicador: string,
  descricaoMeta: string,
  idStatus: number
  idIndicadorExterno: number;
  idIndicadorCatalogoExterno: number;
  metasIndicadorProjeto: IMetaIndicador[];
}

declare var bootstrap: any;

@Component({
  selector: 'siscap-projeto-indicadores',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FiltroIndicadoresComponent,
    FilterCardComponent,
    SelecaoIndicadoresComponent,
    ReactiveFormsModule,
    TemplatesModule
  ],
  templateUrl: './projeto-indicadores.component.html',
  styleUrls: ['./projeto-indicadores.component.scss'],
})
export class ProjetoIndicadoresComponent implements OnInit {

  @Input() formProjeto!: FormGroup;
  @Input() isModoEdicao: boolean = false;
  @Input() isSubcap: boolean = false;
  @Input() statusProjeto: string = '';

  @Output() indicadoresCatalogoCarregados = new EventEmitter<IIndicadoresCatalogoExterno[]>();

  showModal: boolean = false;

  indicadoresBI: IIndicadoresCatalogoExterno[] = [];
  indicadoresFiltrados: IIndicadoresCatalogoExterno[] = [];
  indicadoresSelecionados: IIndicadoresCatalogoExterno[] = [];
  gestao: IGestoesCatalogoExterno | null = null;

  filtroTexto: string = '';
  filtrosAplicados: any[] = [];

  loading: boolean = false;

  chips: FilterChip[] = [];

  currentFilter: any = {};

  constructor(
    private catalogoIndicadorService: CatalogoIndicadorService,
    private fb: FormBuilder,
    private readonly _toastService: ToastService,
    private readonly destroyRef: DestroyRef,
  ) { }

  ngOnInit(): void {

    this.init();

  }

  private init(): void {

    this.loading = true;

    this.catalogoIndicadorService
      .getGestoesIndicadoresCatalogoExternos()
      .pipe(
        tap((gestao) => {
          this.gestao = gestao[0];
          this.initBaseChip();
        }),
        switchMap(() =>
          this.catalogoIndicadorService
            .getIndicadoresPorGestaoCatalogoExternos(
              this.gestao?.idGestao || 0
            )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (indicadores) => {

          this.indicadoresBI = indicadores;
          this.indicadoresFiltrados = indicadores;

          this.indicadoresCatalogoCarregados.emit(this.indicadoresBI);

          this.syncComFormulario();
          this.loading = false;

        },

        error: (err) => {
          console.error('Erro ao carregar dados', err);
          this.loading = false;
        }
      });

  }

  filtrarIndicadores(): void {

    const termo = this.filtroTexto
      ? this.filtroTexto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
      : '';

    this.indicadoresFiltrados = this.indicadoresBI.filter((i) => {
      const nomeNormalizado = i.nomeIndicador
        ?.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      return nomeNormalizado?.includes(termo);
    });

  }

  limparFiltros(): void {
    this.filtroTexto = '';
    this.indicadoresFiltrados = this.indicadoresBI;
    this.initBaseChip();
  }

  removerFiltro(filtro: any): void {
    this.filtrosAplicados = this.filtrosAplicados.filter((f) => f !== filtro);

    if (this.currentFilter?.[filtro.node]) {
      delete this.currentFilter[filtro.node][filtro.field];

      if (Object.keys(this.currentFilter[filtro.node]).length === 0) {
        delete this.currentFilter[filtro.node];
      }
    }

    this.chips = this.chips.filter((c) => c !== filtro);

  }

  onSelecaoChange(novos: IIndicadoresCatalogoExterno[]): void {

    this.indicadoresSelecionados = novos.map(item => ({
      ...item,
      metasIndicadorProjeto:
        item.metasIndicadorProjeto?.length
          ? item.metasIndicadorProjeto
          : this.montarMetasProjetoVazias()
    }));

    this.atualizarFormulario();

  }

  isSelecionado(indicador: IIndicadoresCatalogoExterno): boolean {
    return this.indicadoresSelecionados.some((i) => i.idIndicador === indicador.idIndicador);
  }

  trackByIndicador(_: number, indicador: IIndicadoresCatalogoExterno): number | string {
    return indicador.idIndicador ?? indicador.nomeIndicador;
  }

  trackByMeta(index: number, meta: any): number | string {
    return meta?.get?.('anoMeta')?.value ?? meta?.anoMeta ?? index;
  }

  removerIndicador(indicador: any): void {

    this.indicadoresSelecionados = this.indicadoresSelecionados.filter(
      (i) => i !== indicador,
    );

    this.atualizarFormulario();

  }

  removeIndicadorAvulsoProjeto(index: number): void {
    this.getIndicadoresAvulsos().removeAt(index);
  }

  private syncComFormulario(): void {

    if (!this.formProjeto) return;

    const indicadoresProjeto =
      this.formProjeto.get('indicadoresProjeto')?.value as IndicadorProjetoForm[];

    this.indicadoresSelecionados = this.indicadoresBI
      .filter(indicadorBI =>
        indicadoresProjeto.some(v =>
          (v.idIndicadorCatalogoExterno ?? v.idIndicadorExterno) === indicadorBI.idIndicador
        )
      )
      .map(cat => {
        const doForm = indicadoresProjeto.find(v =>
          (v.idIndicadorCatalogoExterno ?? v.idIndicadorExterno) === cat.idIndicador
        );

        return {
          ...cat,

          idIndicadorProjeto: doForm?.idIndicador,

          ods: doForm?.idIndicador
            ? (doForm as any)?.ods ?? []
            : cat.ods ?? [],

          metasIndicadorProjeto:
            doForm?.metasIndicadorProjeto?.length
              ? doForm.metasIndicadorProjeto
              : this.montarMetasProjetoVazias()

        };

      });

    this.atualizarFormulario();

  }

  private atualizarFormulario(): void {

    const formArrayAtual = this.formProjeto.get('indicadoresProjeto') as FormArray;
    const controlesAtuais = new Map<number, FormGroup>();

    formArrayAtual.controls.forEach(controle => {
      const id = controle.get('idIndicadorExterno')?.value
        ?? controle.get('idIndicadorCatalogoExterno')?.value;
      if (id != null) {
        controlesAtuais.set(Number(id), controle as FormGroup);
      }
    });

    const controles = this.indicadoresSelecionados.map(indicador => {
      const idIndicador = Number(indicador.idIndicador);
      const controleExistente = controlesAtuais.get(idIndicador);
      if (controleExistente) {
        this.removerCamposLegadosDoIndicador(controleExistente);
        return controleExistente;
      }

      const metasProjetoArray = this.fb.array(
        [...(indicador.metasIndicadorProjeto ?? [])]
          .sort((a, b) => Number(a.anoMeta) - Number(b.anoMeta))
          .map((meta: any) => this.fb.group({
            id: [meta.id ?? null],
            idFato: [meta.idFato ?? null],
            anoMeta: [meta.anoMeta],
            valorMeta: [
              meta.valorMeta ?? null,
              [Validators.required, Validators.maxLength(20)]
            ]
          }))
      );

      return this.fb.group({
        idIndicador: [indicador.idIndicadorProjeto ?? null],
        idIndicadorExterno: [idIndicador],
        idIndicadorCatalogoExterno: [idIndicador],
        nomeIndicador: [indicador.nomeIndicador],
        ods: [indicador.ods ?? []],
        metasIndicadorProjeto: metasProjetoArray
      });
    });

    formArrayAtual.clear({ emitEvent: false });
    controles.forEach(controle => formArrayAtual.push(controle, { emitEvent: false }));
    const formArray = formArrayAtual;

    if (!this.isModoEdicao) {
      formArray.disable({ emitEvent: false });
    } else {
      formArray.enable({ emitEvent: false });
    }

    formArray.updateValueAndValidity({ emitEvent: true });

  }

  private removerCamposLegadosDoIndicador(controle: FormGroup): void {
    ['tipoIndicador', 'descricaoIndicador', 'descricaoMeta', 'idStatus']
      .forEach(campo => controle.removeControl(campo, { emitEvent: false }));
  }

  initBaseChip() {
    this.chips = [
      {
        key: 'gestao',
        label: 'GESTÃO ADMINISTRATIVA',
        value: this.gestao?.nomeGestao || '-',
        type: 'base',
        removable: false,
      },
    ];
  }

  openModalFilterIndicator() {
    this.showModal = true;
  }

  onRestaurar(): void {
    this.currentFilter = {};
    this.initBaseChip();
    this.buscarIndicadores();
  }

  // executado quando o filtro é aplicado no componente filho
  onApply(filter: any): void {
    this.currentFilter = structuredClone(filter);
    this.atualizarChipsFiltros();
    this.showModal = false;
    this.buscarIndicadores(this.formatarFiltroIndicadores(filter));
  }

  removeChip(chip: FilterChip): void {
    if (!chip.removable) return;

    if (chip.group === 'label' && chip.valueId != null) {
      const idLabel = Number(chip.key.split(':')[1]);
      const selecionados = this.currentFilter?.labels?.[idLabel] ?? [];
      this.currentFilter.labels[idLabel] = selecionados.filter(
        (id: number) => Number(id) !== chip.valueId
      );

      this.currentFilter.chips.labels = (this.currentFilter.chips.labels ?? [])
        .map((labelChip: any) => ({
          ...labelChip,
          valores: labelChip.idLabel === idLabel
            ? labelChip.valores.filter((valor: any) => Number(valor.idValor) !== chip.valueId)
            : labelChip.valores
        }))
        .filter((labelChip: any) => labelChip.valores.length > 0);
    }

    if (chip.group === 'desafio' && chip.valueId != null) {
      this.currentFilter.desafio.id = (this.currentFilter.desafio?.id ?? [])
        .filter((id: number) => Number(id) !== chip.valueId);
      this.currentFilter.chips.desafio = (this.currentFilter.chips.desafio ?? [])
        .filter((desafio: any) => Number(desafio.idDesafio) !== chip.valueId);
    }

    this.atualizarChipsFiltros();
    this.buscarIndicadores(this.formatarFiltroIndicadores(this.currentFilter));
  }

  removeIndicator(indicador: IIndicadoresCatalogoExterno, isChip: boolean = true): void {

    const index = this.indicadoresSelecionados.findIndex(
      (i) => i.idIndicador === indicador.idIndicador
    );

    if (index !== -1) {
      this.indicadoresSelecionados.splice(index, 1);
      const formArray = this.formProjeto.get('indicadoresProjeto') as FormArray;
      formArray.removeAt(index);
    }

  }

  getIndicadorForm(index: number): FormGroup {
    return this.getIndicadores().at(index) as FormGroup;
  }

  getIndicadores(): FormArray {
    return this.formProjeto.get('indicadoresProjeto') as FormArray;
  }

  getMetas(index: number): FormArray {
    return this.getIndicadorForm(index).get('metasIndicadorProjeto') as FormArray;
  }

  getMetaProjetoControl(indicadorIndex: number, metaIndex: number): FormControl {
    return this.getMetas(indicadorIndex)
      .at(metaIndex)
      .get('valorMeta') as FormControl;
  }

  getIndicadoresAvulsos(): FormArray {
    return this.formProjeto.get('indicadoresAvulsosProjeto') as FormArray;
  }

  getIndicadorAvulsoProjetoForm(index: number): FormGroup {
    return this.getIndicadoresAvulsos().at(index) as FormGroup;
  }

  getMetasIndicadorAvulsoProjeto(index: number): FormArray {
    return this.getIndicadorAvulsoProjetoForm(index).get('metasIndicadorProjeto') as FormArray;
  }

  getMetaIndicadorAvulsoProjetoControl(indicadorIndex: number, metaIndex: number): FormControl {
    return this.getMetasIndicadorAvulsoProjeto(indicadorIndex)
      .at(metaIndex)
      .get('valorMeta') as FormControl;
  }

  voltarParaDic() {
    const tabTrigger = document.getElementById('nav-propriedades');

    if (tabTrigger) {
      const tab = new bootstrap.Tab(tabTrigger);
      tab.show();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }

  irParaODS() {

    if (!this.validarObrigatoriedadeIndicadores()) {
      return;
    }

    const abaOds = document.getElementById('nav-ods-indicadores');
    abaOds?.click();

  }

  private validarObrigatoriedadeIndicadores(): boolean {

    const indicadoresArray = this.formProjeto.get('indicadoresProjeto') as FormArray;
    const indicadoresAvulsosArray = this.formProjeto.get('indicadoresAvulsosProjeto') as FormArray;

    const temIndicadores = indicadoresArray?.length > 0;
    const temIndicadoresAvulsos = indicadoresAvulsosArray?.length > 0;

    if (!temIndicadores && !temIndicadoresAvulsos) {
      this._toastService.showToast('warning', 'O formulário contém erros.', [
        'É obrigatório informar ao menos um indicador.',
      ]);
      return false;
    }

    const algumIndicadorSemMeta =
      indicadoresArray.getRawValue().some((i: any) =>
        i.metasIndicadorProjeto?.some((m: any) => !m.valorMeta)
      ) ||
      indicadoresAvulsosArray.getRawValue().some((i: any) =>
        i.metasIndicadorProjeto?.some((m: any) => !m.valorMeta)
      );

    if (algumIndicadorSemMeta) {
      this._toastService.showToast('warning', 'O formulário contém erros.', [
        'É obrigatório preencher todas as metas dos indicadores.',
      ]);
      return false;
    }

    return true;

  }

  get somenteLeitura(): boolean {
    return !this.podeEditarIndicadores;
  }

  get podeEditarIndicadores(): boolean {

    const status = this.statusProjeto;

    const isEmElaboracao =
      status === StatusProjetoEnum.Em_Elaboracao;

    const isEmAnalise =
      status === StatusProjetoEnum.Em_Analise;

    const isEmComplementacao =
      status === StatusProjetoEnum.Em_Complementacao;

    const podeEditar =
      isEmElaboracao || (isEmAnalise && this.isSubcap) || isEmComplementacao;

    return podeEditar;

  }

  private montarMetasProjetoVazias(): IMetaIndicador[] {

    const doAno = this.gestao?.deAnoMeta ?? 0;
    const ateAno = this.gestao?.ateAnoMeta ?? 0;

    if (!doAno || !ateAno || ateAno < doAno) {
      return [];
    }

    return Array.from(
      { length: ateAno - doAno + 1 },
      (_, index) => ({
        id: null as any,
        anoMeta: doAno + index,
        valorMeta: ''
      })
    );

  }

  getMetasIndicadorBi(index: number): any[] {

    const indicadorSelecionado = this.indicadoresSelecionados?.[index];

    if (!indicadorSelecionado) {
      return [];
    }

    const idIndicador = indicadorSelecionado.idIndicador;
    if (!idIndicador) {
      return [];
    }

    const indicadorBi = this.indicadoresBI?.find(ind =>
      Number(ind.idIndicador) === Number(idIndicador)
    );

    return indicadorBi?.metasIndicador ?? [];

  }

  private atualizarChipsFiltros(): void {

    this.chips = [

      {
        key: 'gestao',
        label: 'GESTÃO ADMINISTRATIVA',
        value: this.gestao?.nomeGestao || '-',
        type: 'base',
        removable: false,
      },

      ...(this.currentFilter?.chips?.labels ?? []).flatMap((labelChip: any) =>
        labelChip.valores.map((valor: any) => ({
          key: `label:${labelChip.idLabel}:${valor.idValor}`,
          label: labelChip.nomeLabel,
          value: valor.nomeValor,
          type: 'filter',
          removable: true,
          group: 'label',
          valueId: Number(valor.idValor)
        }))
      ),

      ...(this.currentFilter?.chips?.desafio ?? []).map((desafio: any) => ({
        key: `desafio:${desafio.idDesafio}`,
        label: 'DESAFIO',
        value: desafio.nomeDesafio,
        type: 'filter',
        removable: true,
        group: 'desafio',
        valueId: Number(desafio.idDesafio)
      }))

    ];

  }

  private formatarFiltroIndicadores(filter: any): IFiltroIndicador {
    return {
      idGestao: Number(filter?.idGestao ?? this.gestao?.idGestao ?? 0),
      labels: Object.entries(filter?.labels ?? {})
        .filter(([_, valores]) => Array.isArray(valores) && valores.length > 0)
        .map(([idLabel, idLabelValores]) => ({
          idLabel: Number(idLabel),
          idLabelValores: (idLabelValores as number[]).map(Number)
        })),
      desafios: (filter?.desafio?.id ?? []).map(Number)
    };
  }

  private buscarIndicadores(filter?: IFiltroIndicador): void {
    if (!this.gestao) return;

    this.loading = true;

    this.catalogoIndicadorService
      .getIndicadoresPorGestaoCatalogoExternos(this.gestao.idGestao, filter)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: indicadores => {
          this.indicadoresBI = indicadores;
          this.indicadoresFiltrados = indicadores;
          this.loading = false;
        },
        error: erro => {
          console.error('Erro ao filtrar indicadores.', erro);
          this.loading = false;
        }
      });
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
