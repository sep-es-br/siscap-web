import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { IGestoesCatalogoExterno, Label } from '../../../core/interfaces/indicadores-catalogo-externo.interface';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-filtro-indicadores',
  standalone: true,
  imports: [FormsModule,
    CommonModule,
    MultiSelectModule
  ],
  templateUrl: './filtro-indicadores.component.html',
  styleUrl: './filtro-indicadores.component.scss'
})
export class FiltroIndicadoresComponent implements OnChanges {
  @Output() apply = new EventEmitter<any>();
  @Input() gestao: IGestoesCatalogoExterno | null = null;
  @Input() desafios: any[] = [];

  gestaoSelecionada!: IGestoesCatalogoExterno;
  labelsOrdenados: Label[] = [];

  filtro: any = {
    idGestao: null,
    labels: {},
    desafio: null
  };

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['gestao']) {
      this.inicializarGestao();
    }

  }

  private inicializarGestao() {

    if (!this.gestao) return;

    if (this.gestao !== null) {
      this.gestaoSelecionada = this.gestao;
    }

    this.filtro.idGestao = this.gestaoSelecionada.idGestao;

    this.atualizarLabels();
  }

  onChangeGestao(idGestao: number) {

    if (this.gestao !== null) {
      this.gestaoSelecionada = this.gestao;
    }

    this.atualizarLabels();
  }

  private atualizarLabels() {
    this.labelsOrdenados = [...(this.gestaoSelecionada?.labels || [])]
      .sort((a, b) => a.ordem - b.ordem);

    // reset dos filtros dinâmicos
    this.filtro.labels = {};
  }

  // onChangeLabel(idLabel: number, valor: number) {
  //   this.filtro.labels[idLabel] = valor;
  // }

  resetar() {
    this.filtro = {
      idGestao: this.gestaoSelecionada?.idGestao || null,
      labels: {},
      desafio: null
    };
  }

  filtrar() {
    console.log('FILTRO FINAL:', this.filtro);
  }

  applyFilter() {
    this.apply.emit('filtro aplicaodo');
  }

  fechar() {
    // fechar modal
  }

}
