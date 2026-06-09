import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FiltroIndicadoresComponent } from './filtro-indicadores/filtro-indicadores.component';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { DialogModule } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { FilterService } from '../../core/services/filter-service/filter-service.service';
import { CheckboxModule } from 'primeng/checkbox';
import { IndicadorChipComponent } from './indicador-chip/indicador-chip.component';
import { SelecaoIndicadoresComponent } from './selecao-indicadores/selecao-indicadores.component';
import { CatalogoIndicadorService } from '../../core/services/catalogo-indicadores/catalogo-indicador.service';
import { BehaviorSubject, filter, map, switchMap, tap } from 'rxjs';
import { IFiltroIndicador, IGestoesCatalogoExterno, IIndicadoresCatalogoExterno, IMetaIndicador } from '../../core/interfaces/indicadores-catalogo-externo.interface';
import { StatusProjetoEnum } from '../../core/enums/status-projeto.enum';
import { ToastService } from '../../core/services/toast/toast.service';

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
    OverlayPanelModule,
    DialogModule,
    Button,
    ChipModule,
    CheckboxModule,
    IndicadorChipComponent,
    SelecaoIndicadoresComponent,
    ReactiveFormsModule
  ],
  templateUrl: './projeto-indicadores.component.html',
  styleUrls: ['./projeto-indicadores.component.scss'],
})
export class ProjetoIndicadoresComponent implements OnInit {
  @Input() formProjeto!: FormGroup;
  @Input() isModoEdicao: boolean = false;
  @Input() isSubcap: boolean = false;
  @Input() statusProjeto: string = '';

  private reloadIndicadores$ = new BehaviorSubject<void>(undefined);

  showModal: boolean = false;

  indicadoresBI: IIndicadoresCatalogoExterno[] = [];
  indicadoresFiltrados: IIndicadoresCatalogoExterno[] = [];
  indicadoresSelecionados: IIndicadoresCatalogoExterno[] = [];
  gestao: IGestoesCatalogoExterno | null = null;

  filtroTexto: string = '';
  filtrosAplicados: any[] = [];

  loading: boolean = false;

  chips: any[] = [];

  currentFilter: any = {};

  constructor(
    private filterService: FilterService,
    private catalogoIndicadorService: CatalogoIndicadorService,
    private fb: FormBuilder,
    private readonly _toastService: ToastService,
  ) { }

  ngOnInit(): void {

    // console.log('Form do projeto vindo do pai:', this.formProjeto?.value);

    this.init();

    this.initBaseChip();

    this.filterService.filter$
      .pipe(
        filter((f): f is IFiltroIndicador => f !== null),
        switchMap((filter) => {
          return this.catalogoIndicadorService
            .getIndicadoresPorGestaoCatalogoExternos(this.gestao?.idGestao || -1, filter);
        })
      )
      .subscribe((indicadores) => {
        this.indicadoresBI = indicadores;
        this.indicadoresFiltrados = indicadores;
        this.loading = false;
      });

  }

  private init(): void {

    this.loading = true;

    this.reloadIndicadores$
      .pipe(

        switchMap(() =>
          this.catalogoIndicadorService
            .getGestoesIndicadoresCatalogoExternos()
        ),

        tap((gestao) => {
          this.gestao = gestao[0];
          this.initBaseChip();
        }),

        switchMap((gestao) =>
          this.catalogoIndicadorService
            .getIndicadoresPorGestaoCatalogoExternos(
              this.gestao?.idGestao || 0
            )
        ),

      )
      .subscribe({
        next: (indicadores) => {
          this.indicadoresBI = indicadores;
          this.indicadoresFiltrados = indicadores;
          this.syncComFormulario();
          this.loading = false;
        },

        error: (err) => {
          console.error('Erro ao carregar dados', err);
          this.loading = false;
        }
      });

    // dispara primeira carga
    this.reloadIndicadores$.next();

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
          metasIndicadorProjeto:
            doForm?.metasIndicadorProjeto?.length
              ? doForm.metasIndicadorProjeto
              : this.montarMetasProjetoVazias()
        };
      });

    this.atualizarFormulario();

  }

  private atualizarFormulario(): void {

    const formArray = this.formProjeto.get('indicadoresProjeto') as FormArray;

    const valoresAtuaisPorIndicador = new Map<number, any>();

    formArray.getRawValue().forEach((item: any) => {
      const id = item.idIndicadorExterno ?? item.idIndicadorCatalogoExterno;
      if (id) {
        valoresAtuaisPorIndicador.set(id, item);
      }
    });

    formArray.clear();

    this.indicadoresSelecionados.forEach(
      (indicador) => {

        const idIndicador = indicador.idIndicador;

        const valorAtual = valoresAtuaisPorIndicador.get(idIndicador);

        const metasBase =
          valorAtual?.metasIndicadorProjeto?.length
            ? valorAtual.metasIndicadorProjeto
            : indicador.metasIndicadorProjeto || [];

        const metasProjetoArray = this.fb.array(
          metasBase.map((meta: any) =>
            this.fb.group({
              id: [meta.id ?? null],
              idFato: [meta.idFato ?? null],
              anoMeta: [meta.anoMeta],
              valorMeta: [meta.valorMeta ?? '', Validators.required]
            })
          )
        );

        formArray.push(
          this.fb.group({
            idIndicador: [valorAtual?.idIndicador ?? indicador.idIndicadorProjeto ?? null],
            idIndicadorExterno: [idIndicador],
            idIndicadorCatalogoExterno: [idIndicador],
            nomeIndicador: [indicador.nomeIndicador],
            ods: [indicador.ods ?? []],
            metasIndicadorProjeto: metasProjetoArray
          })
        );
      });

    if (this.somenteLeitura) {
      formArray.disable({ emitEvent: false });
    } else {
      formArray.enable({ emitEvent: false });
    }

    formArray.updateValueAndValidity({ emitEvent: true });

  }

  initBaseChip() {
    this.chips = [
      {
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

  // executado quando o filtro é aplicado no componente filho
  onApply(filter: any): void {

    this.loading = true

    this.currentFilter = structuredClone(filter);

    this.atualizarChipsFiltros();

    this.showModal = false;

    const filtroFormatado: IFiltroIndicador = {
      idGestao: filter.idGestao,
      labels: Object.entries(filter.labels ?? {})
        .filter(([_, valores]) => Array.isArray(valores) && valores.length > 0)
        .map(([idLabel, idLabelValores]) => ({
          idLabel: Number(idLabel),
          idLabelValores: idLabelValores as number[]
        })),
      desafios: filter.desafio?.id ?? []
    };

    this.filterService.setFilter(filtroFormatado);

  }

  removeChip(chip: any) {

    if (!chip.removable) return;

    this.chips = this.chips.filter((c) => c !== chip);

    if (this.currentFilter?.[chip.node]) {
      delete this.currentFilter[chip.node][chip.field];

      if (Object.keys(this.currentFilter[chip.node]).length === 0) {
        delete this.currentFilter[chip.node];
      }
    }

  }

  onChipClick(chip: any) {
    if (chip.type === 'base') {
      this.showModal = true;
      return;
    }

    this.showModal = true;
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

    // this.atualizarFormulario();

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

  getIndicadoresAvulsos(): FormArray {
    return this.formProjeto.get('indicadoresAvulsosProjeto') as FormArray;
  }

  getIndicadorAvulsoProjetoForm(index: number): FormGroup {
    return this.getIndicadoresAvulsos().at(index) as FormGroup;
  }

  getMetasIndicadorAvulsoProjeto(index: number): FormArray {
    return this.getIndicadorAvulsoProjetoForm(index).get('metasIndicadorProjeto') as FormArray;
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

    const indicadoresArray = this.formProjeto.get('indicadoresProjeto') as FormArray;
    const indicadoresAvulsosArray = this.formProjeto.get('indicadoresAvulsosProjeto') as FormArray;

    const temIndicadores = indicadoresArray && indicadoresArray.length > 0;
    const temIndicadoresAvulsos = indicadoresAvulsosArray && indicadoresAvulsosArray.length > 0;

    if (!temIndicadores && !temIndicadoresAvulsos) {
      this._toastService.showToast('error', 'Erro ao carregar projeto', [
        'É obrigatório informar ao menos um indicador.',
      ]);
      return;
    }

    if (
      indicadoresArray.getRawValue().some((i: any) =>
        i.metasIndicadorProjeto.some((m: any) => !m.valorMeta)
      ) ||
      indicadoresAvulsosArray.getRawValue().some((i: any) =>
        i.metasIndicadorProjeto.some((m: any) => !m.valorMeta)
      )
    ) {
      this._toastService.showToast(
        'error',
        'Erro ao carregar projeto',
        ['É obrigatório preencher todas as metas dos indicadores.']
      );

      return;
    }

    const abaOds = document.getElementById('nav-ods-indicadores')

    abaOds?.click();

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

    const podeEditar =
      isEmElaboracao || (isEmAnalise && this.isSubcap);

    return podeEditar;

  }

  private montarMetasProjetoVazias(): IMetaIndicador[] {

    const doAno = this.gestao?.doAno ?? 0;
    const ateAno = this.gestao?.ateAno ?? 0;

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

    console.log("Current filter:", this.currentFilter)

    this.chips = [

      {
        label: 'GESTÃO ADMINISTRATIVA',
        value: this.gestao?.nomeGestao || '-',
        type: 'base',
        removable: false,
      },
   
      ...(this.currentFilter?.chips?.labels ?? []).flatMap((labelChip: any) =>
        labelChip.valores.map((valor: any) => ({
          label: labelChip.nomeLabel,
          value: valor.nomeValor,
          type: 'filter',
          removable: true,
          idLabel: labelChip.idLabel,
          idValor: valor.idValor
        }))
      ),

      ...(this.currentFilter?.chips?.desafio ?? []).map((desafio: any) => ({
        label: 'DESAFIO',
        value: desafio.nomeDesafio,
        type: 'filter',
        removable: true,
        idDesafio: desafio.idDesafio
      }))

    ];

  }

}
