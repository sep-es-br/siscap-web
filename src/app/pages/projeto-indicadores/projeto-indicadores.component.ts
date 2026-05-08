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
  @Input() form!: FormGroup;
  @Input() isModoEdicao: boolean = false;

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

    // this.catalogoIndicadorService
    //   .getGestoesIndicadoresCatalogoExternos()
    //   .pipe(
    //     tap((gestao) => {
    //       // console.log('📌 Response GESTÃO:', gestao);
    //       this.gestao = gestao[0];
    //       this.initBaseChip();
    //     }),
    //     switchMap((gestao) =>
    //       this.catalogoIndicadorService
    //         .getIndicadoresPorGestaoCatalogoExternos(gestao[0].idGestao)
    //         .pipe(
    //           tap((indicadores) => {
    //             // console.log('📌 Response INDICADORES:', indicadores);
    //           })
    //         )
    //     ),
    //     map((indicadores) =>
    //       indicadores.map((item) => ({
    //         ...item,
    //         metasIndicador: item.metasIndicador ?? []
    //       }))
    //     )
    //   )
    //   .subscribe({
    //     next: (indicadores) => {
    //       this.indicadoresBI = indicadores;
    //       this.indicadoresFiltrados = indicadores;
    //       this.syncComFormulario();
    //     },
    //     error: (err) => {
    //       console.error('Erro ao carregar dados', err);
    //     },
    //     complete: () => {
    //       this.loading = false;
    //     },
    //   });

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
    // this.filterService.setFilter({});
  }

  removerFiltro(filtro: any): void {
    this.filtrosAplicados = this.filtrosAplicados.filter((f) => f !== filtro);

    if (this.currentFilter?.[filtro.node]) {
      delete this.currentFilter[filtro.node][filtro.field];

      if (Object.keys(this.currentFilter[filtro.node]).length === 0) {
        delete this.currentFilter[filtro.node];
      }
    }

    // this.filterService.setFilter(this.currentFilter);

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

    if (!this.form) return;

    const indicadoresProjeto = this.form.get('indicadoresProjeto')?.value as IndicadorProjetoForm[];

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

    const formArrayIndicadoresProjeto = this.form.get('indicadoresProjeto') as FormArray;

    formArrayIndicadoresProjeto.clear();

    this.indicadoresSelecionados.forEach((indicador) => {

      // console.log( '🔄 Sincronizando metas para indicador:', indicador );

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
          idIndicador: indicador.idIndicadorProjeto ?? null,
          idIndicadorExterno: [indicador.idIndicador],
          metasIndicadorProjeto: metasProjetoArray
        })
      );

    });

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

  onApply(filter: any): void {

    console.log('Filtro aplicado:', filter);

    this.showModal = false;

    const filtroFormatado: IFiltroIndicador = {
      // labels: filter.labels?.map((l: any) => l.idLabel),
      // labelValores: filter.labelValores?.map(  (lv: any) => lv.idLabelValor ),
      // desafios: filter.desafios?.map( (d: any) => d.idDesafio )
      labels: filter.labels ?? [],
      labelValores: filter.labelValores ?? [],
      desafios: filter.desafios ?? []
    };

    this.currentFilter = filtroFormatado;

    // const dynamicChips = this.mapToChips(filtroFormatado);
    // const baseChip = this.chips.find((c) => c.type === 'base');
    // this.chips = [baseChip, ...dynamicChips];

    console.log('Filtro formatado:', filtroFormatado);

    this.filterService.setFilter(filtroFormatado);

  }

  // mapToChips(filter: IFiltroIndicador): any[] {

  //   const chips: any[] = [];

  //   Object.keys(filter || {}).forEach((nodeKey) => {

  //     if (nodeKey === 'Administration') return;

  //     const node = filter[nodeKey];

  //     Object.keys(node || {}).forEach((field) => {
  //       const value = node[field];

  //       if (value && value !== '' && value !== 0) {
  //         chips.push({
  //           label: field.toUpperCase(),
  //           value: value,
  //           type: 'filter',
  //           removable: true,
  //           node: nodeKey,
  //           field,
  //         });
  //       }
  //     });
  //   });

  //   return chips;

  // }

  removeChip(chip: any) {

    if (!chip.removable) return;

    this.chips = this.chips.filter((c) => c !== chip);

    if (this.currentFilter?.[chip.node]) {
      delete this.currentFilter[chip.node][chip.field];

      if (Object.keys(this.currentFilter[chip.node]).length === 0) {
        delete this.currentFilter[chip.node];
      }
    }

    // this.filterService.setFilter(this.currentFilter);

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
      const formArray = this.form.get('indicadoresProjeto') as FormArray;
      formArray.removeAt(index);
    }

    this.atualizarFormulario();

  }

  sincronizarMetasProjeto(item: IIndicadoresCatalogoExterno, isModoEdicao: boolean): void {

    const metasExternas = item.metasIndicador ?? [];
    const metasProjeto: IMetaIndicador[] = item.metasIndicadorProjeto ?? [];

    item.metasIndicadorProjeto = metasExternas.map(metaExt => {
      const existente = metasProjeto.find(
        m => m.idFato === metaExt.idFato
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

  getIndicadores(): FormArray {
    return this.form.get('indicadoresProjeto') as FormArray;
  }

  getIndicadorForm(index: number): FormGroup {
    return this.getIndicadores().at(index) as FormGroup;
  }

  getMetas(index: number): FormArray {
    return this.getIndicadorForm(index).get('metasIndicadorProjeto') as FormArray;
  }

  private aplicarFiltros(): void {

    this.indicadoresBI = this.indicadoresSelecionados.filter(indicador => {

      const filtrosLabels = this.currentFilter.labels;

      // return Object.entries(filtrosLabels).every(([idLabel, valores]) => {
      //   if (!valores || (valores as number[]).length === 0) {
      //     return true;
      //   }
      //   // return indicador.labels?.some( label =>
      //   //   label.idLabel === Number(idLabel)
      //   //   && (valores as number[]).includes(label.idLabelValor)
      //   // );
      // });

    });

  }

  voltar() { }

  irParaODS() { }

}
