import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { Desafio, IGestoesCatalogoExterno, Label, LabelValor } from '../../../core/interfaces/indicadores-catalogo-externo.interface';
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

  labelsOriginais: Label[] = [];
  labelsOrdenados: Label[] = [];

  listaDesafiosFiltrados: Desafio[] = [];

  filtro: {

    idGestao: number | null;

    // continua igual para a filtragem
    labels: Record<number, number[]>;
    desafio: any;

    // novo: somente para exibir chips
    chips: {

      labels: Array<{
        idLabel: number;
        nomeLabel: string;
        valores: Array<{
          idValor: number;
          nomeValor: string;
        }>;
      }>;

      desafio?: Array<{
        idDesafio: number;
        nomeDesafio: string;
      }> | [];

    };
  } = {
      idGestao: null,
      labels: {},
      desafio: [],

      chips: {
        labels: [],
        desafio: []
      }
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

    this.labelsOriginais = this.gestaoSelecionada?.labels || [];

    this.labelsOrdenados = this.recalcularLabels(this.gestaoSelecionada?.labels || []);

  }

  private recalcularLabels(labels: Label[]): Label[] {

    const idsSelecionados = Object.values(this.filtro.labels as Record<number, number[]>)
      .flat()
      .filter((id): id is number => id != null);

    return labels.map(label => {

      const labelEhRaiz = label.valores.every(v => v.idPai == null);

      if (labelEhRaiz) {
        return {
          ...label,
          valores: [...label.valores]
        };
      }

      const valoresFiltrados = label.valores.filter(valor => {
        if (valor.idPai == null) {
          return true;
        }

        return idsSelecionados.includes(valor.idPai);
      });

      return {
        ...label,
        valores: valoresFiltrados
      };

    }).sort((a, b) => a.ordem - b.ordem);

  }

  resetar() {
    this.filtro = {
      idGestao: this.gestaoSelecionada?.idGestao || null,
      labels: {},
      desafio: {
        id: []
      },
      chips: {
        labels: [],
        desafio: []
      }
    };
  }

  applyFilter() {
    this.montarChipsFiltro();
    this.apply.emit(this.filtro);
  }

  fechar() {
    this.close.emit();
  }

  dropdownDesafioAberto = false;
  buscaDesafio = '';

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

  getTextoSelecionadosLabel(idLabel: number): string {

    const selecionados = this.filtro?.labels?.[idLabel] ?? [];

    if (selecionados.length === 0) {
      return '';
    }

    if (selecionados.length === 1) {
      const valorSelecionado = this.labelsOrdenados
        .find(label => label.idLabel === idLabel)
        ?.valores
        ?.find(valor => valor.idLabelValor === selecionados[0]);

      return valorSelecionado?.valor ?? '1 selecionado';
    }

    return `${selecionados.length} selecionados`;

  }

  // isLabelFilhoDisabled(label: any): boolean {
  //   if (!this.isLabelFilho(label) ) {
  //     return false;
  //   }
  //   const labelPai = this.getLabelPai(label);
  //   if (!labelPai) {
  //     return true;
  //   }
  //   const selecionadosPai = 
  //     this.filtro.labels[labelPai.idLabel];
  //   return !selecionadosPai || selecionadosPai.length === 0;
  // }

  isLabelFilhoDisabled(label: any): boolean {

    const labelOriginal = this.labelsOriginais.find((l: any) => 
      l.idLabel === label.idLabel || l.nome === label.nome
    );
  
    if (!labelOriginal) {
      return false;
    }
  
    const valores = labelOriginal.valores ?? [];
  
    const temValores = valores.length > 0;
  
    const ehFilho = temValores && valores.every((valor: any) =>
      valor.idPai != null
    );
  
    // Pai/root nunca desabilita por hierarquia
    if (!ehFilho) {
      return false;
    }
  
    const idsPaisDoLabelFilho: number[] = Array.from(
      new Set<number>(
        valores
          .map((valor: any) => Number(valor.idPai))
          .filter((id: number) => !isNaN(id))
      )
    );
  
    const idsSelecionados: number[] = Object.values(this.filtro.labels ?? {})
      .flat()
      .map((id: any) => Number(id))
      .filter((id: number) => !isNaN(id));
  
    const temPaiSelecionado = idsPaisDoLabelFilho.some((idPai: number) =>
      idsSelecionados.includes(idPai)
    );
  
    return !temPaiSelecionado;

  }

  // getValoresLabel(label: any): any[] {
  //   const labelOriginal = this.labelsOriginais.find(l => l.nome === label.nome);
  //   if (!labelOriginal) {
  //     return [];
  //   }
  //   const idsSelecionados: number[] = Object.values(this.filtro.labels ?? {})
  //     .flat()
  //     .map((id: any) => Number(id))
  //     .filter((id: number) => !isNaN(id));
  //   const ehFilho = (labelOriginal.valores ?? []).some((v: any) => v.idPai != null);
  //   if (!ehFilho) {
  //     return labelOriginal.valores ?? [];
  //   }
  //   return (labelOriginal.valores ?? []).filter((valor: any) =>
  //     idsSelecionados.includes(Number(valor.idPai))
  //   );
  // }

  // isLabelsSelecionados(): boolean {
  //   const idsSelecionados = Object.values( this.filtro.labels as Record<number, number[]> )
  //     .flat()
  //     .filter( (id): id is number => id != null );
  //   if (idsSelecionados.length === 0) {
  //     return false;
  //   }
  //   return true;
  // }

  isLabelsFilhosSelecionados(): boolean {
    const labelsFilhos = this.labelsOrdenados.filter((label: any) =>
      this.isLabelFilho(label)
    );
  
    if (!labelsFilhos.length) {
      return true;
    }
  
    return labelsFilhos.every((label: any) => {
      const disabled = this.isLabelFilhoDisabled(label);
  
      if (disabled) {
        return true;
      }
  
      const selecionados = this.filtro.labels?.[label.idLabel] ?? [];
  
      return Array.isArray(selecionados) && selecionados.length > 0;
    });
  }

  onValorLabelChange(label: any, selecionados: any[] | null): void {

    const vazio = !selecionados || selecionados.length === 0;

    if (vazio) {
      this.limparLabelsFilhos(label);
    }

    this.labelsOrdenados = this.recalcularLabels(this.labelsOriginais);

    this.listaDesafiosFiltrados = this.recalcularDesafios();

  }

  private limparLabelsFilhos(labelPai: any): void {

    const idsValoresPai = labelPai.valores.map((v: any) => v.idLabelValor);

    this.labelsOrdenados.forEach(label => {

      const ehFilhoDessePai = label.valores?.some((valor: any) =>
        idsValoresPai.includes(valor.idPai)
      );

      if (ehFilhoDessePai) {

        this.filtro.labels[label.idLabel] = [];

        this.limparLabelsFilhos(label);

      }

    });

  }

  // isLabelFilho(label: Label): boolean {
  //   return label.valores?.some(v => v.idPai != null);
  // }

  isLabelFilho(label: any): boolean {
    const resultado = (label.valores ?? []).some((valor: any) => {
      const idPai = Number(valor.idPai);
      return valor.idPai != null && !isNaN(idPai);
    });
  
    return resultado;
  }

  getLabelPai(labelFilho: Label): any {

    const idsPai = labelFilho.valores
      .filter(v => v.idPai != null)
      .map(v => v.idPai);

    return this.labelsOrdenados.find(label =>
      label.valores?.some(v => idsPai.includes(v.idLabelValor))
    );

  }

  private recalcularDesafios(): Desafio[] {

    const idsSelecionados = Object.values(this.filtro.labels ?? {})
      .flat()
      .filter(id => id != null)
      .map(id => Number(id));

    if (idsSelecionados.length === 0) {
      return this.desafios;
    }

    return this.desafios.filter(desafio => {

      const grupoId = Number(desafio.grupoId);
      const subGrupoId = desafio.subGrupoId != null ? Number(desafio.subGrupoId) : null;

      if (idsSelecionados.includes(grupoId) && subGrupoId != null && idsSelecionados.includes(subGrupoId)) {
        return true;
      } else {
        return false;
      }

    });

  }

  private montarChipsFiltro(): void {

    this.filtro.chips = {

      labels: this.labelsOrdenados
        .map(label => {
          const idsSelecionados = this.filtro.labels[label.idLabel] ?? [];
          const valores = label.valores
            .filter(valor => idsSelecionados.includes(valor.idLabelValor))
            .map(valor => ({
              idValor: valor.idLabelValor,
              nomeValor: valor.valor
            }));

          return {
            idLabel: label.idLabel,
            nomeLabel: label.nome,
            valores
          };
        })
        .filter(chip => chip.valores.length > 0),

      desafio: this.desafiosFiltrados()
        .filter(desafio => (this.filtro.desafio.id ?? []).includes(desafio.id))
        .map(desafio => ({
          idDesafio: desafio.id,
          nomeDesafio: desafio.nome
        }))

    };
  }

}
