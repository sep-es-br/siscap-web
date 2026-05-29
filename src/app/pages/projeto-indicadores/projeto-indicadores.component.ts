import { Component, Input, OnInit } from '@angular/core';
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

export interface IndicadorProjetoForm {
  idIndicador: number;
  tipoIndicador: number;
  descricaoIndicador: string,
  descricaoMeta: string,
  idStatus: number
  idIndicadorExterno: number;
  idIndicadorCatalogoExterno: number;
  metasIndicadorExterno: IMetaIndicador[];
}

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
  ) { }

  ngOnInit(): void {

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
      });

    // console.log('Indicadores filtrados:', this.indicadoresFiltrados);

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

        map((indicadores) =>
          indicadores.map((item) => ({
            ...item,
            metasIndicador: item.metasIndicador ?? []
          }))
        )

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

    this.indicadoresSelecionados = novos.map(item => {
      this.sincronizarMetasProjeto(item, this.isModoEdicao);
      return item;
    });

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

  private syncComFormulario(): void {

    if (!this.formProjeto) return;

    const indicadoresProjeto = this.formProjeto.get('indicadoresProjeto')?.value as IndicadorProjetoForm[];

    this.indicadoresSelecionados = this.indicadoresBI
      .filter(indicadorBI =>
        indicadoresProjeto.some(v => v.idIndicadorCatalogoExterno === indicadorBI.idIndicador)
      )
      .map(cat => {
        const doForm = indicadoresProjeto.find(v => v.idIndicadorCatalogoExterno === cat.idIndicador);
        const item = {
          ...cat,
          idIndicadorProjeto: doForm?.idIndicador,
          metasIndicadorProjeto:
            doForm?.metasIndicadorExterno?.length
              ? doForm.metasIndicadorExterno
              : cat.metasIndicadorProjeto ?? []
        };
        this.sincronizarMetasProjeto(item, this.isModoEdicao);
        return item;
      });

    this.atualizarFormulario();

  }

  private atualizarFormulario(): void {

    const formArrayIndicadoresProjeto = this.formProjeto.get('indicadoresProjeto') as FormArray;

    formArrayIndicadoresProjeto.clear();

    this.indicadoresSelecionados.forEach((indicador) => {

      console.log(
        'Indicador:',
        indicador.nomeIndicador,
        'metasIndicadorProjeto:',
        indicador.metasIndicadorProjeto
      );

      const metasProjetoArray = this.fb.array(
        (indicador.metasIndicadorProjeto || []).map(meta =>
          this.fb.group({
            idFato: [meta.idFato],
            anoMeta: [meta.anoMeta],
            valorMeta: [meta.valorMeta ?? '', Validators.required]
          })
        )
      );

      formArrayIndicadoresProjeto.push(
        this.fb.group({
          idIndicador: [indicador.idIndicadorProjeto ?? null],
          idIndicadorExterno: [indicador.idIndicador],
          idIndicadorCatalogoExterno: [indicador.idIndicador],
          nomeIndicador: [indicador.nomeIndicador],
          ods: [indicador.ods ?? []],
          metasIndicadorProjeto: metasProjetoArray
        })
      );

    });

    if (this.somenteLeitura) {
      this.formProjeto.get('indicadoresProjeto')?.disable({ emitEvent: false });
    } else {
      this.formProjeto.get('indicadoresProjeto')?.enable({ emitEvent: false });
    }

    formArrayIndicadoresProjeto.updateValueAndValidity({ emitEvent: true });

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

    this.atualizarFormulario();

  }

  sincronizarMetasProjeto(item: IIndicadoresCatalogoExterno, isModoEdicao: boolean): void {

    const metasExternas = item.metasIndicador ?? [];
    const metasProjeto: IMetaIndicador[] = item.metasIndicadorProjeto ?? [];

    item.metasIndicadorProjeto = metasExternas.map(metaExt => {
      const existente = metasProjeto.find(
        m => m.anoMeta === metaExt.anoMeta
      );

      if (existente) {
        return existente;
      }

      return {
        idFato: metaExt.idFato,
        anoMeta: metaExt.anoMeta,
        valorMeta: ''
      };
      
    });

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

  // private aplicarFiltros(): void {
  //   this.indicadoresBI = this.indicadoresSelecionados.filter(indicador => {
  //     const filtrosLabels = this.currentFilter.labels;
  //     // return Object.entries(filtrosLabels).every(([idLabel, valores]) => {
  //     //   if (!valores || (valores as number[]).length === 0) {
  //     //     return true;
  //     //   }
  //     //   // return indicador.labels?.some( label =>
  //     //   //   label.idLabel === Number(idLabel)
  //     //   //   && (valores as number[]).includes(label.idLabelValor)
  //     //   // );
  //     // });
  //   });
  // }

  getIndicadoresAvulsos(): FormArray {
    return this.formProjeto.get('indicadoresAvulsosProjeto') as FormArray;
  }

  voltar() { }

  irParaODS() {
    const abaOds = document.getElementById('nav-ods-indicadores');
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

}
