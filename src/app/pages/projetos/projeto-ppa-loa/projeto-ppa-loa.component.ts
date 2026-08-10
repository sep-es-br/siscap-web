import { Component, Input, TrackByFunction } from '@angular/core';
import { NgbModal, NgbModalModule, NgbPopoverModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TemplatesModule } from '../../../shared/templates/templates.module';
import { CommonModule } from '@angular/common';
import { FormArray, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { PpaLoaChipComponent } from './ppa-loa-chip/ppa-loa-chip.component';
import { FiltroAcoesComponent, IFiltroPlanejamento, IPeriodoPlanejamento } from './ppa-loa-filtro/filtro-acoes.component';
import { finalize, Subscription } from 'rxjs';
import { ProjetosService } from '../../../core/services/projetos/projetos.service';
import { ToastService } from '../../../core/services/toast/toast.service';
import { PpaloaIntegracaoBiService } from '../../../core/services/ppaloa-integracao-bi/ppaloa-integracao-bi.service';
import { IAcaoPlanejamentoProjeto } from '../../../core/interfaces/acao-planejamento-projeto.interface';
import { event } from 'jquery';

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
  anoAcao: string;
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

  @Input({ required: true }) projetoForm!: FormGroup;
  @Input() podeEditar!: boolean;

  chips: any[] = [];

  private carregamentoInicialSubscription?: Subscription;

  tituloPlanejamento: any;
  periodoPlanejamento: IPeriodoPlanejamento | null = null;
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
  carregandoAcoes: boolean = false;

  constructor(private readonly _ngbModalService: NgbModal,
    private readonly _toastService: ToastService,
    private readonly _ppaloaIntegracaoService: PpaloaIntegracaoBiService
  ) { }

  ngOnInit(): void {
    this.naoPrevistoPpa = this.projetoForm.get('naoPrevistoNoPpa')?.value ?? false;
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

  onRemoverAcao(acaoInformada: PlanejamentoAcao): void {

    // 1. Remove da lista exibida na tela
    this.acoesPlanejamento = this.acoesPlanejamento.filter(
      acao => this.chaveAcaoBi(acao) !== this.chaveAcaoBi(acaoInformada)
    );

    this.quantidadeAcoes = this.acoesPlanejamento.length;

    // 2. Recupera o controle do formulário
    const controleAcoes =
      this.projetoForm.get('acoesPlanejamentoProjeto');

    if (!controleAcoes) {
      console.error(
        'Controle acoesPlanejamentoProjeto não encontrado.'
      );
      return;
    }

    const acoesDoFormulario =
      (controleAcoes.value as IAcaoPlanejamentoProjeto[] | null) ?? [];

    const chaveRemovida =
      this.chaveAcaoBi(acaoInformada);

    // 3. Remove também do formulário
    const acoesAtualizadas = acoesDoFormulario.filter(
      acaoFormulario =>
        this.chaveAcaoFormulario(acaoFormulario) !== chaveRemovida
    );

    controleAcoes.setValue(acoesAtualizadas);
    controleAcoes.markAsDirty();
    controleAcoes.markAsTouched();
    controleAcoes.updateValueAndValidity();

    // 4. Se não restou nenhuma ação, limpa somente os chips
    if (this.quantidadeAcoes === 0) {

      this.filtrosPlanejamento = [];

      this.currentFilter = {
        periodoPlanejamento: this.periodoPlanejamento,
        idPeriodoPlanejamento: this.periodoPlanejamento?.id
      };

      this.chips = [
        {
          label: 'PLANEJAMENTO',
          value: this.periodoPlanejamento?.descricao || '-',
          type: 'base',
          removable: false
        }
      ];
    }

  }

  private chaveAcaoBi(acao: PlanejamentoAcao): string {

    return [
      this.normalizarCodigo(acao.codigoUnidadeOrcamentaria),
      this.normalizarCodigo(acao.codigoPrograma),
      this.normalizarCodigo(acao.codigoAcao),
      this.normalizarCodigo(acao.codigoFuncao),
      this.normalizarCodigo(acao.anoAcao)
    ].join('|');
  }

  private chaveAcaoFormulario(
    acao: IAcaoPlanejamentoProjeto
  ): string {

    return [
      this.normalizarCodigo(acao.codUo),
      this.normalizarCodigo(acao.codPrograma),
      this.normalizarCodigo(acao.codAcao),
      this.normalizarCodigo(acao.codFuncao),
      this.normalizarCodigo(acao.ano)
    ].join('|');
  }

  private normalizarCodigo(
    valor: string | number | null | undefined
  ): string {

    const codigo = String(valor ?? '').trim();

    // Remove zeros à esquerda:
    // "0012" e 12 passam a ser considerados iguais.
    return codigo.replace(/^0+(?=\d)/, '');
  }

  onNaoPrevistoPpaChange(event: Event): void {

    const input = event.currentTarget as HTMLInputElement;

    this.naoPrevistoPpa = input.checked;

    const controleNaoPrevistoPpa =
      this.projetoForm.get('naoPrevistoNoPpa');

    if (!controleNaoPrevistoPpa) {
      console.error(
        'Controle naoPrevistoNoPpa não encontrado.'
      );
      return;
    }

    controleNaoPrevistoPpa.setValue(this.naoPrevistoPpa);
    controleNaoPrevistoPpa.markAsDirty();
    controleNaoPrevistoPpa.markAsTouched();
    controleNaoPrevistoPpa.updateValueAndValidity();

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

          // Carrega as ações existentes quando estiver editando
          this.carregarAcoesProjetoEdicao();

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
    ppa: string,
    idFuncoes: number[],
    idsProgramas: number[],
    idAnos: number[],
    idUos: number[],
    idsAcoes: number[]
  ): void {

    this.carregandoAcoes = true;

    this._ppaloaIntegracaoService
      .buscarDadosAcoes(
        ppa,
        idFuncoes,
        idsProgramas,
        idAnos,
        idUos,
        idsAcoes
      )
      .pipe(
        finalize(() => {
          this.carregandoAcoes = false;
        })
      )
      .subscribe({

        next: acoes => {

          const novasAcoes: PlanejamentoAcao[] = acoes.map(acao => ({
            ...acao,

            valorTotalDetalhamento: (acao.detalhamentosLoa ?? [])
              .reduce(
                (total, detalhe) =>
                  total + Number(detalhe.valor ?? 0),
                0
              )
          }));

          const acoesPorChave =
            new Map<string, PlanejamentoAcao>();


          // Primeiro mantém as ações que já estavam na tela
          this.acoesPlanejamento.forEach(acao => {

            const chave = this.montarChavePlanejamento(
              acao.codigoAcao,
              acao.codigoFuncao,
              acao.codigoPrograma,
              acao.anoAcao,
              acao.codigoUnidadeOrcamentaria
            );

            acoesPorChave.set(
              chave,
              acao
            );
          });


          // Acrescenta apenas ações que ainda não existem
          novasAcoes.forEach(acao => {

            const chave = this.montarChavePlanejamento(
              acao.codigoAcao,
              acao.codigoFuncao,
              acao.codigoPrograma,
              acao.anoAcao,
              acao.codigoUnidadeOrcamentaria
            );

            if (!acoesPorChave.has(chave)) {
              acoesPorChave.set(
                chave,
                acao
              );
            }

          });

          this.acoesPlanejamento =
            Array.from(acoesPorChave.values());

          this.quantidadeAcoes =
            this.acoesPlanejamento.length;

          const controle = this.projetoForm.get(
            'acoesPlanejamentoProjeto'
          );

          if (!controle) {

            console.error(
              'Controle acoesPlanejamentoProjeto não encontrado.'
            );

            return;
          }


          const acoesAtuais =
            (controle.value as IAcaoPlanejamentoProjeto[] | null)
            ?? [];

          const acoesFormPorChave =
            new Map<string, IAcaoPlanejamentoProjeto>();


          acoesAtuais.forEach(acao => {

            const chave = this.montarChavePlanejamento(
              acao.codAcao,
              acao.codFuncao,
              acao.codPrograma,
              acao.ano,
              acao.codUo
            );

            acoesFormPorChave.set(
              chave,
              acao
            );

          });

          acoes.forEach(acaoBi => {

            const chave = this.montarChavePlanejamento(
              acaoBi.codigoAcao,
              acaoBi.codigoFuncao,
              acaoBi.codigoPrograma,
              acaoBi.anoAcao,
              acaoBi.codigoUnidadeOrcamentaria
            );


            // Já existe no formulário?
            if (acoesFormPorChave.has(chave)) {
              return;
            }


            const novaAcao: IAcaoPlanejamentoProjeto = {

              id: null,

              idProjeto: null,

              codAcao:
                Number(acaoBi.codigoAcao),

              codFuncao:
                Number(acaoBi.codigoFuncao),

              codPrograma:
                Number(acaoBi.codigoPrograma),

              ano:
                String(acaoBi.anoAcao),

              codUo:
                String(acaoBi.codigoUnidadeOrcamentaria)
            };


            acoesFormPorChave.set(
              chave,
              novaAcao
            );

          });

          controle.setValue(
            Array.from(acoesFormPorChave.values())
          );

          controle.markAsDirty();
          controle.updateValueAndValidity();

          this.naoPrevistoPpa = false;

          const controleNaoPrevistoPpa =
            this.projetoForm.get('naoPrevistoNoPpa');


          if (!controleNaoPrevistoPpa) {

            console.error(
              'Controle naoPrevistoNoPpa não encontrado.'
            );

            return;
          }


          controleNaoPrevistoPpa.setValue(
            this.naoPrevistoPpa
          );

          controleNaoPrevistoPpa.markAsDirty();
          controleNaoPrevistoPpa.markAsTouched();
          controleNaoPrevistoPpa.updateValueAndValidity();

        },


        error: erro => {

          console.error(
            'Erro ao consultar dados de ações no BI:',
            erro
          );

          this._toastService.showToast(
            'error',
            'Não foi possível consultar os dados das ações selecionadas.'
          );

          this.quantidadeAcoes = 0;
        }

      });

  }

  private montarChavePlanejamento(
    codAcao: string | number | null | undefined,
    codFuncao: string | number | null | undefined,
    codPrograma: string | number | null | undefined,
    ano: string | number | null | undefined,
    codUo: string | number | null | undefined
  ): string {
    return [
      Number(codAcao),
      Number(codFuncao),
      Number(codPrograma),
      Number(ano),
      Number(codUo)
    ].join('|');
  }

  // private montarChaveAcao(acao: PlanejamentoAcao): string {
  //   return [
  //     acao.codigoOrgao,
  //     acao.codigoUnidadeOrcamentaria,
  //     acao.codigoPrograma,
  //     acao.codigoAcao,
  //     acao.codigoFuncao,
  //     acao.anoAcao
  //   ]
  //     .map(valor => String(valor ?? '').trim())
  //     .join('|');
  // }

  formatarMoeda(valor: number | null | undefined): string {

    if (valor == null) {
      return 'R$ 0,00';
    }

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);

  }

  private carregarAcoesProjetoEdicao(): void {

    if (this.naoPrevistoPpa) {
      return;
    }

    const acoesProjeto =
      this.projetoForm.get('acoesPlanejamentoProjeto')?.value as IAcaoPlanejamentoProjeto[] ?? [];

    if (acoesProjeto.length === 0) {
      return;
    }

    const idsFuncoes = [
      ...new Set(acoesProjeto.map(acao => Number(acao.codFuncao)))
    ];

    const idsProgramas = [
      ...new Set(acoesProjeto.map(acao => Number(acao.codPrograma)))
    ];

    const idsAnos = [
      ...new Set(acoesProjeto.map(acao => Number(acao.ano)))
    ];

    const idsUos = [
      ...new Set(acoesProjeto.map(acao => Number(acao.codUo)))
    ];

    const idsAcoes = [
      ...new Set(acoesProjeto.map(acao => Number(acao.codAcao)))
    ];

    this.carregarAcoesSelecionadas(
      this.periodoPlanejamento?.descricao ?? '',
      idsFuncoes,
      idsProgramas,
      idsAnos,
      idsUos,
      idsAcoes
    );
  }

}
