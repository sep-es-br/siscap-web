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
import { map, switchMap, tap } from 'rxjs';
import { IGestoesCatalogoExterno, IIndicadoresCatalogoExterno, IMetaIndicador } from '../../core/interfaces/indicadores-catalogo-externo.interface';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

export interface IndicadorProjetoForm {
  idIndicador: number;
  metasIndicadorProjeto: IMetaIndicador[];
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

  showModal: boolean = false;

  indicadores: IIndicadoresCatalogoExterno[] = [];
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
    private _ngbModalService: NgbModal,
  ) { }

  ngOnInit(): void {

    // console.log('Form no filho:', this.form);
    // if (this.form) {
    //   console.log('Controles do form:', this.form.controls);
    // } else {
    //   console.error('Form NÃO foi recebido no filho');
    // }

    this.init();
    this.initBaseChip();
    this.filterService.filter$.subscribe((f) => {
      if (f) this.currentFilter = f;
    });

  }

  private init(): void {
    this.loading = true;

    this.catalogoIndicadorService
      .getGestoesIndicadoresCatalogoExternos()
      .pipe(
        tap((gestao) => {
          // console.log('📌 Response GESTÃO:', gestao);
          this.gestao = gestao[0];
          this.initBaseChip();
        }),
        switchMap((gestao) =>
          this.catalogoIndicadorService
            .getIndicadoresPorGestaoCatalogoExternos(gestao[0].idGestao)
            .pipe(
              tap((indicadores) => {
                // console.log('📌 Response INDICADORES:', indicadores);
              })
            )
        ),
        map((indicadores) =>
          indicadores.map((item) => ({
            ...item,
            metasIndicador: item.metasIndicador ?? [],
            metasIndicadorProjeto: item.metasIndicadorProjeto ?? [],
          }))
        )
      )
      .subscribe({
        next: (indicadores) => {
          // console.log('📌 Após MAP (final):', indicadores);
          this.indicadores = indicadores;
          this.indicadoresFiltrados = indicadores;
          this.syncComFormulario();
        },
        error: (err) => {
          console.error('Erro ao carregar dados', err);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  filtrarIndicadores(): void {
    const termo = this.filtroTexto
      ? this.filtroTexto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
      : '';

    this.indicadoresFiltrados = this.indicadores.filter((i) => {
      const nomeNormalizado = i.nomeIndicador
        ?.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      return nomeNormalizado?.includes(termo);
    });

  }

  limparFiltros(): void {
    this.filtroTexto = '';
    this.indicadoresFiltrados = this.indicadores;

    this.initBaseChip();
    this.filterService.setFilter({});
  }

  removerFiltro(filtro: any): void {
    this.filtrosAplicados = this.filtrosAplicados.filter((f) => f !== filtro);

    // sincroniza com o estado global também
    if (this.currentFilter?.[filtro.node]) {
      delete this.currentFilter[filtro.node][filtro.field];

      if (Object.keys(this.currentFilter[filtro.node]).length === 0) {
        delete this.currentFilter[filtro.node];
      }
    }

    this.filterService.setFilter(this.currentFilter);

    // atualiza chips também
    this.chips = this.chips.filter((c) => c !== filtro);
  }

  onSelecaoChange(novos: IIndicadoresCatalogoExterno[]): void {
    this.indicadoresSelecionados = novos.map(item => {
      this.sincronizarMetasProjeto(item);
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

    const valores = this.form.get('indicadoresProjeto')?.value as IndicadorProjetoForm[];

    this.indicadoresSelecionados = this.indicadores
      .filter(cat =>
        valores.some(v => v.idIndicador === cat.idIndicador)
      )
      .map(cat => {
        const doForm = valores.find(v => v.idIndicador === cat.idIndicador);

        const item = {
          ...cat,
          metasIndicadorProjeto: doForm?.metasIndicadorProjeto || []
        };

        this.sincronizarMetasProjeto(item);

        return item;
      });

    this.atualizarFormulario();

  }

  private atualizarFormulario(): void {

    // console.log('>>> ENTROU NO atualizarFormulario');

    const formArray = this.form.get('indicadoresProjeto') as FormArray;

    formArray.clear(); // importante para resetar o estado do formulário e evitar dados obsoletos

    this.indicadoresSelecionados.forEach((indicador) => {

      const metasFormArray = this.fb.array(
        (indicador.metasIndicadorProjeto || []).map(meta =>
          this.fb.group({
            idFato: [meta.idFato],
            anoMeta: [meta.anoMeta],
            valorMeta: [meta.valorMeta || '', Validators.required]
          })
        )
      );

      formArray.push(
        this.fb.group({
          idIndicadorExterno: [indicador.idIndicador],
          metas: metasFormArray
        })
      );

    });

    // 🔎 DEBUG AQUI
    // console.log('Após atualizarFormulario:', this.form.value);
    // console.log('Form válido:', this.form.valid);

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

  onApply(filter: any) {
    this.showModal = false;

    this.currentFilter = filter;

    const dynamicChips = this.mapToChips(filter);
    const baseChip = this.chips.find((c) => c.type === 'base');

    this.chips = [baseChip, ...dynamicChips];

    this.filterService.setFilter(filter);
  }

  mapToChips(filter: any): any[] {
    const chips: any[] = [];

    Object.keys(filter || {}).forEach((nodeKey) => {
      if (nodeKey === 'Administration') return;

      const node = filter[nodeKey];

      Object.keys(node || {}).forEach((field) => {
        const value = node[field];

        if (value && value !== '' && value !== 0) {
          chips.push({
            label: field.toUpperCase(),
            value: value,
            type: 'filter',
            removable: true,
            node: nodeKey,
            field,
          });
        }
      });
    });

    return chips;
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

    this.filterService.setFilter(this.currentFilter);
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
    }

    this.atualizarFormulario();

  }

  sincronizarMetasProjeto(item: IIndicadoresCatalogoExterno) {

    const metasExternas = item.metasIndicador || [];
    const metasProjeto = item.metasIndicadorProjeto || [];

    item.metasIndicadorProjeto = metasExternas.map(metaExt => {

      const existente = metasProjeto.find(
        m => m.anoMeta === metaExt.anoMeta
      );

      return existente || {
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
    return this.getIndicadorForm(index).get('metas') as FormArray;
  }

  voltar() { }

  irParaODS() { }

}
