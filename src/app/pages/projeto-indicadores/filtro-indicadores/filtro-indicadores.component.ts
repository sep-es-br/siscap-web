import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { Desafio, IGestoesCatalogoExterno, Label } from '../../../core/interfaces/indicadores-catalogo-externo.interface';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MultiSelectModule } from 'primeng/multiselect';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-filtro-indicadores',
  standalone: true,
  imports: [FormsModule,
    CommonModule,
    MultiSelectModule,
    CommonModule,
    FormsModule,
    NgSelectModule
  ],
  templateUrl: './filtro-indicadores.component.html',
  styleUrl: './filtro-indicadores.component.scss'
})
export class FiltroIndicadoresComponent implements OnChanges {
  @Output() apply = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  @Input() gestao: IGestoesCatalogoExterno | null = null;
  @Input() desafios: Desafio[] = [];
  @Input() somenteLeitura: boolean = false;
  @Input() filtroAtual: any = null;

  gestaoSelecionada!: IGestoesCatalogoExterno;
  labelsOrdenados: Label[] = [];

  filtro: any = {
    idGestao: null,
    labels: {},
    desafio: {}
  };

  ngOnInit() {
    // console.log('Desafios recebidos:', this.desafios);
    // console.log('Labels gestão:', this.gestao?.labels);
    // console.log('Valores labels gestão:', this.gestao?.labels?.flatMap(label => label.valores));
  }

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['gestao']) {
      this.inicializarGestao();
    }

  }
  
  private inicializarGestao() {
    if (!this.gestao) return;

    this.gestaoSelecionada = this.gestao;

    this.filtro = {
      idGestao: this.gestaoSelecionada.idGestao,
      labels: {},
      desafio: {
        id: []
      },
      ...(this.filtroAtual ? structuredClone(this.filtroAtual) : {})
    };

    this.filtro.labels ??= {};
    this.filtro.desafio ??= { id: [] };
    this.filtro.desafio.id ??= [];

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
    this.filtro.labels ??= {};

  }

  resetar() {
    this.filtro = {
      idGestao: this.gestaoSelecionada?.idGestao || null,
      labels: {},
      desafio: {
        id: []
      }
    };
  }

  filtrar() {
    // console.log('FILTRO FINAL:', this.filtro);
  }

  applyFilter() {
    this.apply.emit(this.filtro);
  }
  
  fechar() {
    this.close.emit();
  }

  dropdownDesafioAberto = false;
  buscaDesafio = '';

  // onDebug(ids: number[]): void {
  //   // console.log(ids);
  // }

  abrirDropdownDesafio(): void {
    this.dropdownDesafioAberto = !this.dropdownDesafioAberto;
  }

  desafiosFiltrados() {
    const busca = this.buscaDesafio?.toLowerCase() ?? '';
    return this.desafios.filter(d =>
      d.nome.toLowerCase().includes(busca)
    );
  }

  toggleDesafio(id: number): void {
    const selecionados: number[] = this.filtro.desafio.id ?? [];
    if (selecionados.includes(id)) {
      this.filtro.desafio.id = selecionados.filter(x => x !== id);
    } else {
      this.filtro.desafio.id = [...selecionados, id];
    }
  }

}
