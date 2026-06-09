import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { IGestoesCatalogoExterno, IIndicadoresCatalogoExterno } from '../../../core/interfaces/indicadores-catalogo-externo.interface';
import { IndicadorAvulsoComponent } from '../indicador-avulso/indicador-avulso.component';

@Component({
  selector: 'app-selecao-indicadores',
  standalone: true,
  imports: [CommonModule, FormsModule, CheckboxModule, InputTextModule, IndicadorAvulsoComponent],
  templateUrl: './selecao-indicadores.component.html',
  styleUrls: ['./selecao-indicadores.component.scss']
})
export class SelecaoIndicadoresComponent implements OnInit, OnChanges {

  private _indicadores: IIndicadoresCatalogoExterno[] = [];

  @Input() form!: FormGroup;
  @Input() selecionados: IIndicadoresCatalogoExterno[] = [];
  @Input() loading: boolean = false;
  @Input() gestao: IGestoesCatalogoExterno | null = null;
  @Input() set indicadores(value: IIndicadoresCatalogoExterno[]) {
    this._indicadores = value || [];
    this.filtrarIndicadores();
    this.updateSelectAllState();
  }
  @Input() somenteLeitura: boolean = false;
  @Output() selecionadosChange = new EventEmitter<any[]>();

  @ViewChild('searchInput')
  searchInput!: ElementRef<HTMLInputElement>;

  get indicadores() {
    return this._indicadores;
  }

  indicadoresFiltrados: IIndicadoresCatalogoExterno[] = [];
  filtroTexto: string = '';
  searchVisible: boolean = false;
  selectAll: boolean = false;
  showModalIndicadorAvulso: boolean = false;

  ngOnInit() {
    this.indicadoresFiltrados = this.indicadores;
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

    const termo = this.filtroTexto
      ? this.filtroTexto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      : '';

    this.indicadoresFiltrados = this.montarIndicadoresExibicao().filter(i => {
      const nomeNormalizado = i.nomeIndicador
        ?.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      return nomeNormalizado?.includes(termo);
    });

    this.updateSelectAllState();

  }

  toggleIndicador(indicador: any): void {

    if (this.isSelecionado(indicador)) {
      this.selecionados = this.selecionados.filter(i =>
        !this.mesmoIndicador(i, indicador)
      );
    } else {
      const indicadorSelecionado = this.montarIndicadorSelecionado(indicador);
      this.selecionados = [
        ...this.selecionados,
        indicadorSelecionado
      ];
    }

    this.selecionadosChange.emit([...this.selecionados]);

  }

  toggleSelectAll(event: any): void {
    let novasSelecoes = [...this.selecionados];

    if (this.selectAll) {
      const novos = this.indicadoresFiltrados.filter(i => !this.isSelecionado(i));
      novasSelecoes = [...novasSelecoes, ...novos];
    } else {
      const idsFiltrados = this.indicadoresFiltrados.map(i => i.idIndicador);
      novasSelecoes = novasSelecoes.filter(i => !idsFiltrados.includes(i.idIndicador));
    }

    this.selecionadosChange.emit(novasSelecoes);
  }

  private updateSelectAllState(): void {
    this.selectAll = this.indicadoresFiltrados.length > 0 &&
      this.indicadoresFiltrados.every(i => this.isSelecionado(i));
  }

  isSelecionado(indicador: any): boolean {
    return (this.selecionados || []).some(i =>
      this.mesmoIndicador(i, indicador)
    );
  }

  showNewIndicatorForm(): void {
    this.showModalIndicadorAvulso = true;
  }

  onCloseModalIndicadorAvulso(): void {
    this.showModalIndicadorAvulso = false;
    this.filtrarIndicadores();
    this.selecionadosChange.emit(this.selecionados);
  }

  private montarIndicadoresExibicao(): any[] {

    const indicadoresCatalogo = this.indicadores || [];

    const indicadoresAvulsos =
      this.form?.get('indicadoresAvulsosProjeto')?.value ?? [];

    const avulsosParaLista = indicadoresAvulsos.map((avulso: any) => ({
      ...avulso,
      id: avulso.id ?? null,
      idIndicadorAvulso: avulso.idIndicadorAvulso ?? avulso.indicadorAvulso?.id,
      idIndicador: `avulso-${avulso.idIndicadorAvulso ?? avulso.indicadorAvulso?.id ?? avulso.id ?? avulso.nomeIndicador}`,
      nomeIndicador: avulso.indicadorAvulso?.nomeIndicador ?? avulso.nomeIndicador,
      metasIndicadorProjeto: avulso.metasIndicadorProjeto ?? [],
      avulso: true
    }));

    return [
      ...indicadoresCatalogo,
      ...avulsosParaLista
    ];

  }

  onIndicadorAvulsoCriado(indicador: any): void {

    // this.selecionados = [
    //   ...this.selecionados,
    //   {
    //     ...indicador,
    //     nomeIndicador: indicador.nomeIndicador,
    //     formulaCalculo: indicador.formulaCalculo,
    //     fonteIndicador: indicador.fonteIndicador,
    //     unidadeMedida: indicador.unidadeMedida,
    //     basedeReferencia: indicador.basedeReferencia,
    //     metasIndicadorProjeto: indicador.metasIndicadorAvulsoProjeto,
    //     avulso: true
    //   }
    // ];

    this.filtrarIndicadores();

    this.selecionadosChange.emit([...this.selecionados]);

  }

  private mesmoIndicador(a: any, b: any): boolean {

    const aEhAvulso = a.avulso === true;
    const bEhAvulso = b.avulso === true;

    if (aEhAvulso || bEhAvulso) {
      return (a.nomeIndicador ?? '').trim().toLowerCase()
        === (b.nomeIndicador ?? '').trim().toLowerCase();
    }

    return a.idIndicador === b.idIndicador;
  }

  private montarIndicadorSelecionado(indicador: any): any {

    if (indicador.avulso) {
      return {
        ...indicador,
        nomeIndicador: indicador.nomeIndicador,
        fonteIndicador: indicador.fonteIndicador,
        unidadeMedida: indicador.unidadeMedida,
        basedeReferencia: indicador.basedeReferencia,
        metasIndicador: indicador.metasIndicador
          ?? indicador.metasIndicadorAvulsoGeral
          ?? [],
        metasIndicadorProjeto: indicador.metasIndicadorProjeto
          ?? indicador.metasIndicadorProjeto
          ?? [],
        avulso: true
      };
    }

    return indicador;

  }

  toggleSearch(): void {
    if (this.somenteLeitura) {
      return;
    }
    this.searchVisible = !this.searchVisible;
    if (this.searchVisible) {
      setTimeout(() => {
        this.searchInput?.nativeElement.focus();
      });
    }
  }

  limparBusca(): void {
    if (this.somenteLeitura) {
      return;
    }
    this.filtroTexto = '';
    this.filtrarIndicadores();
    this.searchInput?.nativeElement.focus();
  }

}
