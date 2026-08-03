import { Component, TrackByFunction } from '@angular/core';
import { NgbModal, NgbModalModule, NgbPopoverModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TemplatesModule } from '../../../shared/templates/templates.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { PpaLoaChipComponent } from './ppa-loa-chip/ppa-loa-chip.component';
import { FiltroAcoesComponent, IFiltroPlanejamento, IPeriodoPlanejamento } from './ppa-loa-filtro/filtro-acoes.component';
import { finalize, Subscription } from 'rxjs';
import { ProjetosService } from '../../../core/services/projetos/projetos.service';
import { ToastService } from '../../../core/services/toast/toast.service';
import { PpaloaIntegracaoBiService } from '../../../core/services/ppaloa-integracao-bi/ppaloa-integracao-bi.service';

export interface PlanejamentoAcao {
  id: number;
  codigo?: string;
  titulo: string;
  descricao?: string;
  unidadeOrcamentaria?: string;
  orgao?: string;
  funcao?: string;
  programa?: string;
  periodoPpa?: string;
  valorPpa?: number;
  anoLoa?: number;
  valorLoa?: number;
  detalhamentoOrcamentarioLoa: DetalhamentoOrcamentarioLoa[];
}

export interface DetalhamentoOrcamentarioLoa {
  codigoGnd?: string;
  codigoModalidade?: string;
  idUso?: string;
  fonte?: string;
  valor?: number;
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

  private carregamentoInicialSubscription?: Subscription;

  tituloPlanejamento: any;
  periodoPlanejamento: IPeriodoPlanejamento | undefined;
  acoesPlanejamento: PlanejamentoAcao[] = [];

  filtrosPlanejamento: PlanejamentoFiltroAplicado[] = [];

  naoPrevistoPpa = false;
  somenteLeitura: boolean = false;
  quantidadeAcoes: number = 0;
  filtrosAplicados: any[] = [];

  currentFilter: Partial<IFiltroPlanejamento> | null = null;

  trackByFiltro: TrackByFunction<any> = (_, filtro) => filtro.id;
  trackByAcao: TrackByFunction<PlanejamentoAcao> = (_, acao) => acao.id;

  showModal: boolean = false;
  carregandoDadosIniciais: boolean = false;
  loading: boolean = false;

  constructor(private readonly _ngbModalService: NgbModal,
    private readonly _projetosService: ProjetosService,
    private readonly _toastService: ToastService,
    private readonly _ppaloaIntegracaoService: PpaloaIntegracaoBiService
  ) { }

  ngOnInit(): void {
    this.initBaseChip();
  }

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

    this.carregamentoInicialSubscription?.unsubscribe();

    this.carregandoDadosIniciais = true;

    this._ppaloaIntegracaoService
      .buscarPeriodoPpaVigente()
      .subscribe({
        next: (periodo) => {

          this.periodoPlanejamento = periodo;

          this.chips = [
            {
              label: 'PLANEJAMENTO',
              value: periodo.descricao || '-',
              type: 'base',
              removable: false,
            },
          ];

          this.currentFilter = {
            idPeriodoPlanejamento: periodo.id
          };

        },
        error: (erro) => {
          console.error('Erro ao buscar período:', erro);
        }
      });

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

    this.loading = true

    this.currentFilter = structuredClone(filter);

    this.atualizarChipsFiltros();

    this.showModal = false;

    if (this.currentFilter?.idsAcoes?.length == 0)
      return

    this.carregarAcoesSelecionadas(this.currentFilter?.idsAcoes ?? []);

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

  private atualizarChipsFiltros(): void {

    this.chips = [

      {
        label: 'PLANEJAMENTO',
        value: this.periodoPlanejamento?.descricao || '-',
        type: 'base',
        removable: false,
      },

      ...(this.currentFilter?.chips?.anos ?? []).map((ano: any) => ({
        label: 'ANO',
        value: ano.nome,
        type: 'filter',
        removable: true,
        idAno: ano.id
      })),

      ...(this.currentFilter?.chips?.uos ?? []).map((uo: any) => ({
        label: 'UO',
        value: uo.nome,
        type: 'filter',
        removable: true,
        idUo: uo.id
      })),


      ...(this.currentFilter?.chips?.funcoes ?? []).map((funcao: any) => ({
        label: 'FUNCAO',
        value: funcao.nome,
        type: 'filter',
        removable: true,
        idFuncao: funcao.id
      })),

      ...(this.currentFilter?.chips?.programas ?? []).map((programa: any) => ({
        label: 'PROGRAMA',
        value: programa.nome,
        type: 'filter',
        removable: true,
        idDesafio: programa.id
      })),

      ...(this.currentFilter?.chips?.acoes ?? []).map((acao: any) => ({
        label: 'AÇÃO',
        value: acao.nome,
        type: 'filter',
        removable: true,
        idDesafio: acao.id
      }))

    ];

  }

  private carregarAcoesSelecionadas(
    chavesAcoes: number[]
  ): void {

    this.loading = true;

    this._projetosService
      .buscarDadosAcoes(chavesAcoes)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: acoes => {

          this.acoesPlanejamento = acoes;

          // this.atualizarAcoesProjeto(chavesAcoes);

          this.quantidadeAcoes = this.acoesPlanejamento.length ?? 0;

          console.log('Açoes selecionadas :', this.acoesPlanejamento)

        },
        error: erro => {

          console.error('Erro ao consultar dados de ações no BI:', erro);

          this._toastService.showToast('error', 'Não foi possível consultar os dados das ações selecionadas.');

          this.quantidadeAcoes = 0;

        }
      });

  }

  formatarMoeda(valor: number | null | undefined): string {
    
    if (valor == null) {
      return 'R$ 0,00';
    }

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);

  }

}
