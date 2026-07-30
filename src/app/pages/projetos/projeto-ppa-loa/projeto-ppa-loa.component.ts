import { Component, TrackByFunction } from '@angular/core';
import { NgbModal, NgbModalModule, NgbPopoverModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TemplatesModule } from '../../../shared/templates/templates.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { PpaLoaChipComponent } from './ppa-loa-chip/ppa-loa-chip.component';
import { FiltroAcoesComponent } from './ppa-loa-filtro/filtro-acoes.component';

export interface PlanejamentoAcao {
  id: number;
  codigo?: string;
  titulo: string;
  descricao?: string;
  tipo?: string;
  programa?: string;
  objetivoEstrategico?: string;
  unidadeResponsavel?: string;
  produto?: string;
}

export interface PlanejamentoFiltroAplicado {
  id: number | string;
  label: string;
  valor: string;
}
@Component({
  selector: 'siscap-projeto-ppa-loa',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgbTooltipModule,
    NgbModalModule,
    NgbPopoverModule,
    TemplatesModule,
    Button,
    DialogModule,
    PpaLoaChipComponent,
    FiltroAcoesComponent],
  templateUrl: './projeto-ppa-loa.component.html',
  styleUrl: './projeto-ppa-loa.component.scss'
})
export class ProjetoPpaLoaComponent {

  chips: any[] = [];

  tituloPlanejamento: any;
  periodoPlanejamento: any;
  acoesPlanejamento: PlanejamentoAcao[] = [];
  filtrosPlanejamento: PlanejamentoFiltroAplicado[] = [];

  naoPrevistoPpa = false;
  somenteLeitura: boolean = false;
  quantidadeAcoes: number = 0;
  filtrosAplicados: any[] = [];

  currentFilter: any = {};

  trackByFiltro: TrackByFunction<any> = (_, filtro) => filtro.id;
  trackByAcao: TrackByFunction<PlanejamentoAcao> = (_, acao) => acao.id;

  showModal: boolean = false;

  constructor(private readonly _ngbModalService: NgbModal) { }

  abrirModalFiltrosPlanejamento(modalTemplateRef: any): void {
    const modalRef = this._ngbModalService.open(modalTemplateRef, {
      centered: true,
    });
    modalRef.result.then(
      (result) => {
        // this.alterarStatusProjeto(result);
      },
      (reject) => { },
    );
  }

  removerAcaoPlanejamento(acao: PlanejamentoAcao): void {
    this.acoesPlanejamento = this.acoesPlanejamento.filter(
      item => item.id !== acao.id,
    );
  }

  removerFiltroPlanejamento(
    filtro: PlanejamentoFiltroAplicado,
  ): void {
    this.filtrosPlanejamento = this.filtrosPlanejamento.filter(
      item => item.id !== filtro.id,
    );
  }

  alterarNaoPrevistoPpa(naoPrevisto: boolean): void {
    this.naoPrevistoPpa = naoPrevisto;
  }

  onRemoverAcao(_t32: any) {
    throw new Error('Method not implemented.');
  }

  onNaoPrevistoPpaChange($event: Event) {
    throw new Error('Method not implemented.');
  }

  onRemoverFiltro(_t10: any) {
    throw new Error('Method not implemented.');
  }

  onAbrirFiltros() {
    throw new Error('Method not implemented.');
  }

  initBaseChip() {
    this.chips = [
      {
        label: 'PLANEJAMENTO',
        value: '-',
        type: 'base',
        removable: false,
      },
    ];
  }

  onChipClick(chip: any) {
    if (chip.type === 'base') {
      this.showModal = true;
      return;
    }

    this.showModal = true;
  }

  removeChip(chip: any) {

    if (!chip.removable) return;

    this.chips = this.chips.filter((c) => c !== chip);

    if (this.filtrosPlanejamento?.[chip.node]) {
      delete this.filtrosPlanejamento[chip.node];

      if (Object.keys(this.filtrosPlanejamento[chip.node]).length === 0) {
        delete this.filtrosPlanejamento[chip.node];
      }
    }

  }

  onRestaurar(): void {
    this.initBaseChip();
  }

  onApply(filter: any): void {

    // this.loading = true

    // this.currentFilter = structuredClone(filter);

    // this.atualizarChipsFiltros();

    this.showModal = false;

    // const filtroFormatado: IFiltroIndicador = {
    //   idGestao: filter.idGestao,
    //   labels: Object.entries(filter.labels ?? {})
    //     .filter(([_, valores]) => Array.isArray(valores) && valores.length > 0)
    //     .map(([idLabel, idLabelValores]) => ({
    //       idLabel: Number(idLabel),
    //       idLabelValores: idLabelValores as number[]
    //     })),
    //   desafios: filter.desafio?.id ?? []
    // };

    // this.filterService.setFilter(filtroFormatado);

  }

}
