import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FiltroIndicadoresComponent } from "./filtro-indicadores/filtro-indicadores.component";
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { DialogModule } from 'primeng/dialog';
import { Button } from "primeng/button";
import { ChipModule } from 'primeng/chip';
import { FilterService } from '../../core/services/filter-service/filter-service.service';
import { CheckboxModule } from 'primeng/checkbox';
import { IndicadorChipComponent } from './indicador-chip/indicador-chip.component';
import { SelecaoIndicadoresComponent } from './selecao-indicadores/selecao-indicadores.component';

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
    SelecaoIndicadoresComponent
  ],
  templateUrl: './projeto-indicadores.component.html',
  styleUrls: ['./projeto-indicadores.component.scss']
})
export class ProjetoIndicadoresComponent implements OnInit {

  constructor(private filterService: FilterService) { }

  @Input() form!: FormGroup;
  @Input() isModoEdicao: boolean = false;

  showModal: boolean = false;

  indicadores: any[] = [];
  indicadoresFiltrados: any[] = [];
  indicadoresSelecionados: any[] = [];
  gestao: any;

  filtroTexto: string = '';
  filtrosAplicados: any[] = [];

  loading: boolean = false;

  chips: any[] = [];

  currentFilter: any = {};

  ngOnInit(): void {
    this.init();
    this.initBaseChip();

    this.filterService.filter$.subscribe(f => {
      if (f) this.currentFilter = f;
    });
  }

  private init(): void {
    this.carregarGestaoAdministrativa();
    this.carregarIndicadores();
    this.syncComFormulario();
  }

  carregarIndicadores(): void {
    this.loading = true;

    // Simulation of data to match the image requirements
    this.indicadores = [
      { id: 1, nome: 'NÚMERO DE MATRÍCULAS EM EDUCAÇÃO PROFISSIONAL' },
      { id: 2, nome: 'TAXA DE EVASÃO TÉCNICO' },
      { id: 3, nome: 'TAXA DE PROFESSORES EFETIVOS' },
      { id: 4, nome: 'ÍNDICE DE EMPREGABILIDADE DE EGRESSOS' },
      { id: 5, nome: 'INVESTIMENTO PÚBLICO EM CULTURA' },
      { id: 6, nome: 'NÚMERO DE PROJETOS CULTURAIS APOIADOS' }
    ];

    this.indicadoresFiltrados = this.indicadores;
    this.loading = false;
  }

  carregarGestaoAdministrativa(): void {
    this.gestao = {
      periodo: '2023-26'
    };
  }

  filtrarIndicadores(): void {
    const termo = this.filtroTexto
      ? this.filtroTexto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      : '';

    this.indicadoresFiltrados = this.indicadores.filter(i => {
      const nomeNormalizado = i.nome?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
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
    this.filtrosAplicados =
      this.filtrosAplicados.filter(f => f !== filtro);

    // sincroniza com o estado global também
    if (this.currentFilter?.[filtro.node]) {
      delete this.currentFilter[filtro.node][filtro.field];

      if (Object.keys(this.currentFilter[filtro.node]).length === 0) {
        delete this.currentFilter[filtro.node];
      }
    }

    this.filterService.setFilter(this.currentFilter);

    // atualiza chips também
    this.chips = this.chips.filter(c => c !== filtro);
  }

  onSelecaoChange(novos: any[]): void {
    this.indicadoresSelecionados = novos;
    this.atualizarFormulario();
  }

  isSelecionado(indicador: any): boolean {
    return this.indicadoresSelecionados.some(i => i.id === indicador.id);
  }

  removerIndicador(indicador: any): void {
    this.indicadoresSelecionados =
      this.indicadoresSelecionados.filter(i => i !== indicador);

    this.atualizarFormulario();
  }

  private syncComFormulario(): void {
    if (!this.form) return;

    const valores = this.form.get('indicadoresProjeto')?.value;

    if (valores) {
      this.indicadoresSelecionados = valores;
    }
  }

  private atualizarFormulario(): void {
    if (!this.form) return;

    this.form.get('indicadoresProjeto')?.setValue(
      this.indicadoresSelecionados
    );
  }

  initBaseChip() {
    this.chips = [
      {
        label: 'GESTÃO ADMINISTRATIVA',
        value: this.gestao?.periodo || '2023-26',
        type: 'base',
        removable: false
      }
    ];
  }

  onApply(filter: any) {
    this.showModal = false;

    this.currentFilter = filter;

    const dynamicChips = this.mapToChips(filter);
    const baseChip = this.chips.find(c => c.type === 'base');

    this.chips = [baseChip, ...dynamicChips];

    this.filterService.setFilter(filter);
  }

  mapToChips(filter: any): any[] {
    const chips: any[] = [];

    Object.keys(filter || {}).forEach(nodeKey => {
      if (nodeKey === 'Administration') return;

      const node = filter[nodeKey];

      Object.keys(node || {}).forEach(field => {
        const value = node[field];

        if (value && value !== '' && value !== 0) {
          chips.push({
            label: field.toUpperCase(),
            value: value,
            type: 'filter',
            removable: true,
            node: nodeKey,
            field
          });
        }
      });
    });

    return chips;
  }

  removeChip(chip: any) {
    if (!chip.removable) return;

    this.chips = this.chips.filter(c => c !== chip);

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

  voltar() { }

  irParaODS() { }
}
