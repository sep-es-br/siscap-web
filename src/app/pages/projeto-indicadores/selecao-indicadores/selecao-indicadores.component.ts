import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-selecao-indicadores',
  standalone: true,
  imports: [CommonModule, FormsModule, CheckboxModule, InputTextModule],
  templateUrl: './selecao-indicadores.component.html',
  styleUrls: ['./selecao-indicadores.component.scss']
})
export class SelecaoIndicadoresComponent implements OnInit, OnChanges {
  private _indicadores: any[] = [];
  @Input() set indicadores(value: any[]) {
    //console.log('SET INPUT:', value);
    this._indicadores = value || [];
    this.filtrarIndicadores();
    this.updateSelectAllState();
  }
  get indicadores() {
    return this._indicadores;
  }

  @Input() selecionados: any[] = [];
  @Input() loading: boolean = false;

  @Output() selecionadosChange = new EventEmitter<any[]>();

  indicadoresFiltrados: any[] = [];
  filtroTexto: string = '';
  searchVisible: boolean = false;
  selectAll: boolean = false;

  ngOnInit() {
    //this.indicadoresFiltrados = this.indicadores;
    this.updateSelectAllState();
  }

  ngOnChanges(changes: SimpleChanges) {
    // if (changes['indicadores']) {
    //   this.filtrarIndicadores();
    // }
    // if (changes['selecionados'] || changes['indicadores']) {
    //   this.updateSelectAllState();
    // }
  }

  filtrarIndicadores(): void {

    //console.log('ANTES FILTRO:', this._indicadores);

    const termo = this.filtroTexto
      ? this.filtroTexto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      : '';

    this.indicadoresFiltrados = this.indicadores.filter(i => {
      const nomeNormalizado = i.nomeIndicador?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return nomeNormalizado?.includes(termo);
    });

    this.updateSelectAllState();

    //console.log('DEPOIS FILTRO:', this.indicadoresFiltrados);

  }

  toggleIndicador(indicador: any): void {
    let novasSelecoes = [...this.selecionados];
    const exists = this.isSelecionado(indicador);

    if (exists) {
      novasSelecoes = novasSelecoes.filter(i => i.id !== indicador.id);
    } else {
      novasSelecoes.push(indicador);
    }

    this.selecionadosChange.emit(novasSelecoes);
  }

  toggleSelectAll(event: any): void {
    let novasSelecoes = [...this.selecionados];

    if (this.selectAll) {
      const novos = this.indicadoresFiltrados.filter(i => !this.isSelecionado(i));
      novasSelecoes = [...novasSelecoes, ...novos];
    } else {
      const idsFiltrados = this.indicadoresFiltrados.map(i => i.id);
      novasSelecoes = novasSelecoes.filter(i => !idsFiltrados.includes(i.id));
    }

    this.selecionadosChange.emit(novasSelecoes);
  }

  private updateSelectAllState(): void {
    this.selectAll = this.indicadoresFiltrados.length > 0 &&
      this.indicadoresFiltrados.every(i => this.isSelecionado(i));
  }

  isSelecionado(indicador: any): boolean {
    return (this.selecionados || []).some(i => i.id === indicador.idIndicador);
  }
}
