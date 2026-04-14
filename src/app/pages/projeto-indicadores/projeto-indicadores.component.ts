import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'siscap-projeto-indicadores',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './projeto-indicadores.component.html',
  styleUrls: ['./projeto-indicadores.component.scss']
})
export class ProjetoIndicadoresComponent implements OnInit {

  // 🔗 integração com tela principal
  @Input() form!: FormGroup;
  @Input() isModoEdicao: boolean = false;

  // 📊 dados
  indicadores: any[] = [];
  indicadoresFiltrados: any[] = [];
  indicadoresSelecionados: any[] = [];
  gestao: any;

  // 🔎 filtros
  filtroTexto: string = '';
  filtrosAplicados: any[] = [];

  // 🎛 controle de UI
  loading: boolean = false;

  // ===============================
  // 🚀 LIFECYCLE
  // ===============================

  ngOnInit(): void {
    this.init();
  }

  private init(): void {
    this.carregarGestaoAdministrativa();
    this.carregarIndicadores();
    this.syncComFormulario();
  }

  // ===============================
  // 📡 DADOS
  // ===============================

  carregarIndicadores(): void {
    this.loading = true;

    // TODO: integrar com API
    this.indicadores = [];

    this.indicadoresFiltrados = this.indicadores;

    this.loading = false;
  }

  carregarGestaoAdministrativa(): any {
    this.gestao = {
      periodo: '2023-2026'
    };
  }

  // ===============================
  // 🔎 FILTROS
  // ===============================

  filtrarIndicadores(): void {
    const termo = this.filtroTexto?.toLowerCase() || '';

    this.indicadoresFiltrados = this.indicadores.filter(i =>
      i.nome?.toLowerCase().includes(termo)
    );
  }

  aplicarFiltros(filtros: any[]): void {
    this.filtrosAplicados = filtros;

    // TODO: aplicar filtros reais (eixo, área, desafio...)
  }

  removerFiltro(filtro: any): void {
    this.filtrosAplicados =
      this.filtrosAplicados.filter(f => f !== filtro);
  }

  limparFiltros(): void {
    this.filtrosAplicados = [];
    this.filtroTexto = '';
    this.indicadoresFiltrados = this.indicadores;
  }

  // ===============================
  // ✅ SELEÇÃO DE INDICADORES
  // ===============================

  toggleIndicador(indicador: any): void {
    const exists = this.isSelecionado(indicador);

    if (exists) {
      this.indicadoresSelecionados =
        this.indicadoresSelecionados.filter(i => i !== indicador);
    } else {
      this.indicadoresSelecionados.push(indicador);
    }

    this.atualizarFormulario();
  }

  isSelecionado(indicador: any): boolean {
    return this.indicadoresSelecionados.includes(indicador);
  }

  removerIndicador(indicador: any): void {
    this.indicadoresSelecionados =
      this.indicadoresSelecionados.filter(i => i !== indicador);

    this.atualizarFormulario();
  }

  // ===============================
  // 🧾 FORMULÁRIO
  // ===============================

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

  // ===============================
  // 🪟 MODAIS
  // ===============================

  abrirModalFiltros(): void {
    // TODO: integrar com NgbModal
  }

  abrirModalNovoIndicador(): void {
    // TODO: abrir modal de criação
  }

}