import { Component, TrackByFunction } from '@angular/core';
import { NgbModal, NgbModalModule, NgbPopoverModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TemplatesModule } from '../../../shared/templates/templates.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

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

    // FiltroIndicadoresComponent,
    // OverlayPanelModule,
    // DialogModule,
    // Button,
    // ChipModule,
    // CheckboxModule,
    // IndicadorChipComponent,
    // SelecaoIndicadoresComponent

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
    DialogModule,],
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
  somenteLeitura: any;
  quantidadeAcoes: any;
  filtrosAplicados: any;

  trackByFiltro: TrackByFunction<any> = (_, filtro) => filtro.id;
  trackByAcao: TrackByFunction<PlanejamentoAcao> = (_, acao) => acao.id;

  showModal: boolean = false;

  constructor( private readonly _ngbModalService: NgbModal ) { }

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
        value: this.gestao?.nomeGestao || '-',
        type: 'base',
        removable: false,
      },
    ];
  }

}
