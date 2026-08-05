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
  codigoOrgao: string | null;
  siglaOrgao: string | null;
  nomeOrgao: string | null;
  codigoUnidadeOrcamentaria: string | null;
  siglaUnidadeOrcamentaria: string | null;
  nomeUnidadeOrcamentaria: string | null;
  codigoPrograma: string | null;
  nomePrograma: string | null;
  codigoAcao: string | null;
  nomeAcao: string | null;
  codigoFuncao: string | null;
  nomeFuncao: string | null;
  valorPpa: number | null;
  valorLoa: number;
  detalhamentosLoa: DetalhamentoOrcamentarioLoa[];
  valorTotalDetalhamento?: number;
}

export interface DetalhamentoOrcamentarioLoa {
  codigoGnd: string | null;
  codigoModalidade: string | null;
  idUso: string | null;
  fonte: string | null;
  valor: number | null;
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

  trackByDetalhamentoLoa(
    index: number,
    detalhe: DetalhamentoOrcamentarioLoa
  ): string {
    return `${detalhe.codigoGnd}-${detalhe.codigoModalidade}-${detalhe.idUso}-${detalhe.fonte}-${index}`;
  }

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

  onRemoverAcao(acao: any) {

  //   id: number;
  // codigoOrgao: string | null;
  // siglaOrgao: string | null;
  // nomeOrgao: string | null;
  // codigoUnidadeOrcamentaria: string | null;
  // siglaUnidadeOrcamentaria: string | null;
  // nomeUnidadeOrcamentaria: string | null;
  // codigoPrograma: string | null;
  // nomePrograma: string | null;
  // codigoAcao: string | null;
  // nomeAcao: string | null;
  // codigoFuncao: string | null;
  // nomeFuncao: string | null;
  // valorPpa: number | null;
  // valorLoa: number;
  // detalhamentosLoa: DetalhamentoOrcamentarioLoa[];
  // valorTotalDetalhamento?: number;
  
  ppa, idFuncoes, idsProgramas, idAnos, idUos, idsAcoes
    
    this.acoesPlanejamento = this.acoesPlanejamento
         .filter(o => o.odsId !== ods.odsId);
   
       const odsProjetoArray = this.formProjeto.get('odsProjeto') as FormArray;
   
       const index = odsProjetoArray.controls.findIndex(control =>
         control.get('odsId')?.value === ods.odsId
       );
   
       if (index >= 0) {
         odsProjetoArray.removeAt(index);
       }
   
       this.atualizarOdsSugeridas();
   
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
            periodoPlanejamento: periodo,
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

    this.carregarAcoesSelecionadas(this.currentFilter?.periodoPlanejamento?.descricao ?? '',
      this.currentFilter?.idsFuncoes ?? [],
      this.currentFilter?.idsProgramas ?? [],
      this.currentFilter?.idsAnos ?? [],
      this.currentFilter?.idsUos ?? [],
      this.currentFilter?.idsAcoes ?? []);

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
    ppa: string, idFuncoes: number[], idsProgramas: number[], idAnos: number[], idUos: number[], idsAcoes: number[]
  ): void {

    this.loading = true;

    this._ppaloaIntegracaoService
      .buscarDadosAcoes(ppa, idFuncoes, idsProgramas, idAnos, idUos, idsAcoes)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: acoes => {

          // this.acoesPlanejamento = acoes;

          this.acoesPlanejamento = acoes.map( acao => ({
            ...acao,
            valorTotalDetalhamento: ( acao.detalhamentosLoa ?? [])
              .reduce(
                (total, detalhe) =>
                  total + Number(detalhe.valor ?? 0), 0 )
          }));

          this.quantidadeAcoes = this.acoesPlanejamento.length ?? 0;

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
