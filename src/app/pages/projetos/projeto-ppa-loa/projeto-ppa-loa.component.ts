import { Component, ElementRef, Input, TrackByFunction, ViewChild } from '@angular/core';
import { NgbModal, NgbModalModule, NgbPopoverModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TemplatesModule } from '../../../shared/templates/templates.module';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { FiltroAcoesComponent, IFiltroPlanejamento, IOpcaoPlanejamento, IPeriodoPlanejamento } from './ppa-loa-filtro/filtro-acoes.component';
import { finalize, Subscription } from 'rxjs';
import { ToastService } from '../../../core/services/toast/toast.service';
import { PpaloaIntegracaoBiService } from '../../../core/services/ppaloa-integracao-bi/ppaloa-integracao-bi.service';
import { IAcaoPlanejamentoProjeto } from '../../../core/interfaces/acao-planejamento-projeto.interface';
import { CheckboxModule } from 'primeng/checkbox';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { FilterCardComponent } from '../../../shared/components/filter-card/filter-card.component';
import { FilterChip } from '../../../shared/components/filter-card/filter-chip.interface';
import { TooltipModule } from 'primeng/tooltip';

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
  nomeGrupoDespesa: string | null;
  nomeModalidade: string | null;
  nomeIdUso: string | null;
  nomeFonte: string | null;

}

export interface PlanejamentoFiltroAplicado {
  id: number | string;
  label: string;
  valor: string;
}

@Component({
  selector: 'siscap-projeto-ppa-loa',
  standalone: true,
  imports: [
    CommonModule,
    NgSelectModule,
    NgbTooltipModule,
    NgbModalModule,
    NgbPopoverModule,
    TemplatesModule,
    FilterCardComponent,
    FiltroAcoesComponent,
    CheckboxModule,
    FormsModule,
    InputTextModule,
    TooltipModule
  ],
  templateUrl: './projeto-ppa-loa.component.html',
  styleUrl: './projeto-ppa-loa.component.scss'
})
export class ProjetoPpaLoaComponent {

  @Input({ required: true }) projetoForm!: FormGroup;
  @Input() podeEditar!: boolean;

  chips: FilterChip[] = [];

  private carregamentoInicialSubscription?: Subscription;

  tituloPlanejamento: any;
  periodoPlanejamento: IPeriodoPlanejamento | null = null;
  acoesPlanejamento: PlanejamentoAcao[] = [];

  filtrosPlanejamento: PlanejamentoFiltroAplicado[] = [];

  naoPrevistoPpa = false;
  somenteLeitura: boolean = false;
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
  carregandoAcoes: boolean = false;

  listaAcoes: any[] = [];
  listaAcoesFiltradas: any[] = [];

  selectAll: boolean = false;
  private readonly idsAcoesSelecaoPendente = new Set<number>();

  searchVisible: boolean = false;

  @ViewChild('searchInput')
  searchInput!: ElementRef<HTMLInputElement>;

  filtroTexto: string = '';

  private acoesSubscription?: Subscription;

  private acoesPlanejamentoBackup: PlanejamentoAcao[] = [];
  private acoesPlanejamentoProjetoBackup: IAcaoPlanejamentoProjeto[] = [];

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

    this.acoesPlanejamento = this.acoesPlanejamento.filter(
      acao => this.chaveAcaoBi(acao) !== this.chaveAcaoBi(acaoInformada)
    );

    // this.quantidadeAcoes = this.acoesPlanejamento.length;

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

    const acoesAtualizadas = acoesDoFormulario.filter(
      acaoFormulario =>
        this.chaveAcaoFormulario(acaoFormulario) !== chaveRemovida
    );

    controleAcoes.setValue(acoesAtualizadas);
    controleAcoes.markAsDirty();
    controleAcoes.markAsTouched();
    controleAcoes.updateValueAndValidity();

    if (this.quantidadeAcoes === 0) {

      this.filtrosPlanejamento = [];

      this.currentFilter = {
        periodoPlanejamento: this.periodoPlanejamento,
        idPeriodoPlanejamento: this.periodoPlanejamento?.id
      };

      this.chips = [
        {
          key: 'planejamento',
          label: 'PLANEJAMENTO',
          value: this.periodoPlanejamento?.descricao || '-',
          type: 'base',
          removable: false
        }
      ];
    } else {
      this.reconstruirFiltroPelasAcoes();
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

    return codigo.replace(/^0+(?=\d)/, '');

  }

  onNaoPrevistoPpaChange(event: Event): void {

    const input = event.currentTarget as HTMLInputElement;

    this.naoPrevistoPpa = input.checked;
    if (this.naoPrevistoPpa) {
      this.showModal = false;
    }

    const controleNaoPrevistoPpa =
      this.projetoForm.get('naoPrevistoNoPpa');

    const controleAcoes =
      this.projetoForm.get('acoesPlanejamentoProjeto') as FormControl<IAcaoPlanejamentoProjeto[]>;

    if (!controleNaoPrevistoPpa) {
      console.error(
        'Controle naoPrevistoNoPpa não encontrado.'
      );
      return;
    }

    // this.acoesPlanejamento = [];
    // this.projetoForm.get('acoesPlanejamentoProjeto')?.setValue([]);

    // console.table(
    //   this.acoesPlanejamento.map(a => ({
    //     id: a.id,
    //     codigoAcao: a.codigoAcao,
    //     codigoPrograma: a.codigoPrograma,
    //     anoAcao: a.anoAcao,
    //     codigoUnidadeOrcamentaria: a.codigoUnidadeOrcamentaria
    //   }))
    // );

    if (this.naoPrevistoPpa) {

      if (this.acoesPlanejamento.length > 0) {

        this.acoesPlanejamentoBackup =
          structuredClone(this.acoesPlanejamento);

        this.acoesPlanejamentoProjetoBackup =
          structuredClone(controleAcoes.value);

      }

      this.acoesPlanejamento = [];

      controleAcoes?.setValue([]);

      this.initBaseChip()

    } else {

      // Restaura o que estava selecionado anteriormente
      this.acoesPlanejamento =
        structuredClone(this.acoesPlanejamentoBackup);

      controleAcoes?.setValue(
        structuredClone(this.acoesPlanejamentoProjetoBackup)
      );

    }

    controleNaoPrevistoPpa.setValue(this.naoPrevistoPpa);
    controleNaoPrevistoPpa.markAsDirty();
    controleNaoPrevistoPpa.markAsTouched();
    controleNaoPrevistoPpa.updateValueAndValidity();

  }

  abrirFiltroPlanejamento(): void {
    if (!this.podeEditar || this.naoPrevistoPpa) return;

    this.showModal = true;
  }

  initBaseChip() {

    this.carregamentoInicialSubscription?.unsubscribe();

    this.carregandoDadosIniciais = true;

    this.carregamentoInicialSubscription = this._ppaloaIntegracaoService
      .buscarPeriodoPpaVigente()
      .pipe(
        finalize(() => {
          this.carregandoDadosIniciais = false;
        })
      )
      .subscribe({
        next: (periodo) => {

          this.periodoPlanejamento = periodo;

          this.chips = [
            {
              key: 'planejamento',
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

          this.listaAcoes = [];
          this.listaAcoesFiltradas = [];

          this.carregarAcoesProjetoEdicao();

        },
        error: (erro) => {
          console.error('Erro ao buscar período:', erro);
        }
      });

  }

  removeChip(chip: FilterChip): void {
    if (!chip.removable) return;

    this.removerCriterioPlanejamento(chip);
    this.atualizarChipsFiltros();
  }

  onRestaurar(): void {
    this.acoesSubscription?.unsubscribe();

    const anoFixado = this.obterAnoFixadoPelasAcoes();
    const chipAnoAtual = this.currentFilter?.chips?.anos?.find(
      ano => Number(ano.id) === anoFixado
    );

    this.currentFilter = {
      periodoPlanejamento: this.periodoPlanejamento,
      idPeriodoPlanejamento: this.periodoPlanejamento?.id ?? null,
      idsAnos: anoFixado != null ? [anoFixado] : [],
      idsUos: [],
      idsFuncoes: [],
      idsProgramas: [],
      chips: {
        anos: anoFixado != null
          ? [chipAnoAtual ?? { id: anoFixado, nome: String(anoFixado) }]
          : [],
        uos: [],
        funcoes: [],
        programas: [],
        acoes: []
      }
    };

    // A lista disponível pertence ao filtro anterior. Mantê-la após restaurar
    // permite selecionar uma ação usando UO/função/programa já apagados.
    this.listaAcoes = [];
    this.listaAcoesFiltradas = [];
    this.filtroTexto = '';
    this.selectAll = false;
    this.carregandoAcoes = false;

    this.atualizarChipsFiltros();
  }

  onApply(filter: any): void {

    this.currentFilter = structuredClone(filter);

    if (this.currentFilter?.idsAnos?.length == 0 || this.currentFilter?.idsUos?.length == 0) {

      this._toastService.showToast(
        'error',
        'Obrigatório informar ano e uo para carregamento das açoes.'
      );

      return;

    }

    this.atualizarChipsFiltros();

    this.carregarListaAcoes(true);

    this.showModal = false;

  }

  private atualizarChipsFiltros(): void {

    const chips: FilterChip[] = [

      {
        key: 'planejamento',
        label: 'PLANEJAMENTO',
        value: this.periodoPlanejamento?.descricao || '-',
        type: 'base',
        removable: false,
      },

      ...(this.currentFilter?.chips?.anos ?? []).map(ano => ({
        key: `anos:${ano.id}`,
        label: 'ANO',
        value: ano.nome,
        type: 'filter' as const,
        removable: this.quantidadeAcoes === 0,
        group: 'anos',
        valueId: Number(ano.id)
      })),
      ...(this.currentFilter?.chips?.uos ?? []).map(uo => ({
        key: `uos:${uo.id}`,
        label: 'UO',
        value: uo.nome,
        type: 'filter' as const,
        removable: true,
        group: 'uos',
        valueId: Number(uo.id)
      })),
      ...(this.currentFilter?.chips?.funcoes ?? []).map(funcao => ({
        key: `funcoes:${funcao.id}`,
        label: 'FUNÇÃO',
        value: funcao.nome,
        type: 'filter' as const,
        removable: true,
        group: 'funcoes',
        valueId: Number(funcao.id)
      })),
      ...(this.currentFilter?.chips?.programas ?? []).map(programa => ({
        key: `programas:${programa.id}`,
        label: 'PROGRAMA',
        value: programa.nome,
        type: 'filter' as const,
        removable: true,
        group: 'programas',
        valueId: Number(programa.id)
      }))

    ];

    this.chips = Array.from(
      new Map(chips.map(chip => [chip.key, chip])).values()
    );

  }

  private obterAnoFixadoPelasAcoes(): number | null {
    const acoesFormulario =
      (this.projetoForm.get('acoesPlanejamentoProjeto')?.value as IAcaoPlanejamentoProjeto[] | null)
      ?? [];
    const ano = acoesFormulario
      .map(acao => Number(acao.ano))
      .find(valor => Number.isFinite(valor) && valor > 0);

    return ano ?? null;
  }

  private obterAnosParaRequisicao(): number[] {
    const anosFiltro = Array.from(
      new Set(
        (this.currentFilter?.idsAnos ?? [])
          .map(ano => Number(ano))
          .filter(ano => Number.isFinite(ano) && ano > 0)
      )
    );

    if (anosFiltro.length > 0) return anosFiltro;

    const anoFixado = this.obterAnoFixadoPelasAcoes();
    return anoFixado != null ? [anoFixado] : [];
  }

  private reconstruirFiltroPelasAcoes(): void {
    if (this.acoesPlanejamento.length === 0) return;

    const criarOpcoes = (
      codigo: (acao: PlanejamentoAcao) => string | null,
      nome: (acao: PlanejamentoAcao) => string | null
    ) => Array.from(
      new Map(
        this.acoesPlanejamento
          .map(acao => {
            const codigoOriginal = String(codigo(acao) ?? '').trim();
            const id = Number(codigoOriginal);
            if (!codigoOriginal || !Number.isFinite(id)) return null;

            const descricao = String(nome(acao) ?? '').trim();
            return [
              id,
              {
                id,
                nome: descricao ? `${codigoOriginal} - ${descricao}` : codigoOriginal
              }
            ] as const;
          })
          .filter((item): item is readonly [number, { id: number; nome: string }] => item != null)
      ).values()
    );

    const anos = criarOpcoes(acao => acao.anoAcao, () => null);
    const uos = criarOpcoes(
      acao => acao.codigoUnidadeOrcamentaria,
      acao => acao.nomeUnidadeOrcamentaria
    );
    const funcoes = criarOpcoes(acao => acao.codigoFuncao, acao => acao.nomeFuncao);
    const programas = criarOpcoes(acao => acao.codigoPrograma, acao => acao.nomePrograma);

    this.currentFilter = {
      periodoPlanejamento: this.periodoPlanejamento,
      idPeriodoPlanejamento: this.periodoPlanejamento?.id ?? null,
      idsAnos: anos.map(item => item.id),
      idsUos: uos.map(item => item.id),
      idsFuncoes: funcoes.map(item => item.id),
      idsProgramas: programas.map(item => item.id),
      chips: { anos, uos, funcoes, programas, acoes: [] }
    };

    this.atualizarChipsFiltros();
  }

  private removerCriterioPlanejamento(chip: FilterChip): void {
    if (!this.currentFilter || !chip.group) return;

    type CampoIdsPlanejamento =
      | 'idsAnos'
      | 'idsUos'
      | 'idsFuncoes'
      | 'idsProgramas';

    const idsPorGrupo: Record<string, CampoIdsPlanejamento> = {
      anos: 'idsAnos',
      uos: 'idsUos',
      funcoes: 'idsFuncoes',
      programas: 'idsProgramas'
    };
    const campoIds = idsPorGrupo[chip.group];

    if (!campoIds) return;

    (this.currentFilter as any)[campoIds] = [];

    const ordemDependencias = ['anos', 'uos', 'funcoes', 'programas'];
    const indiceGrupo = ordemDependencias.indexOf(chip.group);
    const gruposParaLimpar = ordemDependencias.slice(indiceGrupo + 1);

    gruposParaLimpar.forEach(grupo => {
      (this.currentFilter as any)[idsPorGrupo[grupo]] = [];
    });

    const chipsAtuais = this.currentFilter.chips;
    if (!chipsAtuais) return;

    (chipsAtuais as any)[chip.group] = [];
    gruposParaLimpar.forEach(grupo => {
      (chipsAtuais as any)[grupo] = [];
    });
  }

  private carregarAcoesSelecionadas(
    ppa: string,
    idFuncoes: number[],
    idsProgramas: number[],
    idAnos: number[],
    idUos: number[],
    idsAcoes: number[],
    carregarListaFiltrada = false
  ): void {

    let carregarListaAposConsulta = false;

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

          if (carregarListaAposConsulta) {
            this.carregarListaAcoes(true);
          }
        })
      )
      .subscribe({

        next: acoes => {

          idsAcoes.forEach(id => this.idsAcoesSelecaoPendente.delete(Number(id)));

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

          this.reconstruirFiltroPelasAcoes();
          carregarListaAposConsulta = carregarListaFiltrada;

          // this.quantidadeAcoes =
          //   this.acoesPlanejamento.length;

          const controle = this.projetoForm.get('acoesPlanejamentoProjeto');

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
                String(idAnos[0]),
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

          this.updateSelectAllState();

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

          idsAcoes.forEach(id => this.idsAcoesSelecaoPendente.delete(Number(id)));

          console.error(
            'Erro ao consultar dados de ações no BI:',
            erro
          );

          this._toastService.showToast(
            'error',
            'Não foi possível consultar os dados das ações selecionadas.'
          );

          this.updateSelectAllState();

          // this.quantidadeAcoes = 0;
        }

      });

    if (idAnos.length > 0) {

      this.currentFilter = {
        ...this.currentFilter,
        idsAnos: idAnos
      };

    }

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

    this.currentFilter = {
      ...this.currentFilter,
      idsAnos: idsAnos
    };

    this.carregarAcoesSelecionadas(
      this.periodoPlanejamento?.descricao ?? '',
      idsFuncoes,
      idsProgramas,
      idsAnos,
      idsUos,
      idsAcoes,
      true
    );

  }

  public toggleAcao(acao: IOpcaoPlanejamento) {

    if (this.isSelecionado(acao)) {
      this.acoesPlanejamento = this.acoesPlanejamento.filter(a =>
        !this.mesmaAcao(a, acao)
      );
      // this.quantidadeAcoes = this.acoesPlanejamento.length;
    } else {

      const idsAnos = this.obterAnosParaRequisicao();

      const idsUos = [
        ...new Set(this.currentFilter?.idsUos)
      ];

      const idsFuncoes = [
        ...new Set(this.currentFilter?.idsFuncoes)
      ];

      const idsProgramas = [
        ...new Set(this.currentFilter?.idsProgramas)
      ];

      const idsAcoes = [
        ...new Set([acao.id])
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

  isSelecionado(acao: any): boolean {
    return this.idsAcoesSelecaoPendente.has(Number(acao.id)) ||
      (this.acoesPlanejamento || []).some(i =>
        this.mesmaAcao(i, acao)
      );
  }

  private mesmaAcao(a: any, b: any): boolean {

    return Number(a.codigoAcao) === b.id;

  }

  toggleSelectAll(event: any): void {
    const checked = event?.checked ?? this.selectAll;
    this.selectAll = checked;

    const idsAcoesFiltradas = new Set(
      this.listaAcoesFiltradas.map(acao => Number(acao.id))
    );

    if (idsAcoesFiltradas.size === 0) {
      this.selectAll = false;
      return;
    }

    if (checked) {
      const idsAcoesNaoSelecionadas = this.listaAcoesFiltradas
        .filter(acao => !this.isSelecionado(acao))
        .map(acao => Number(acao.id));

      if (idsAcoesNaoSelecionadas.length === 0) {
        this.updateSelectAllState();
        return;
      }

      idsAcoesNaoSelecionadas.forEach(id =>
        this.idsAcoesSelecaoPendente.add(id)
      );
      this.updateSelectAllState();

      this.carregarAcoesSelecionadas(
        this.periodoPlanejamento?.descricao ?? '',
        [...new Set(this.currentFilter?.idsFuncoes ?? [])],
        [...new Set(this.currentFilter?.idsProgramas ?? [])],
        this.obterAnosParaRequisicao(),
        [...new Set(this.currentFilter?.idsUos ?? [])],
        idsAcoesNaoSelecionadas
      );
      return;
    }

    idsAcoesFiltradas.forEach(id =>
      this.idsAcoesSelecaoPendente.delete(id)
    );

    this.acoesPlanejamento = this.acoesPlanejamento.filter(
      acao => !idsAcoesFiltradas.has(Number(acao.codigoAcao))
    );

    const controle = this.projetoForm.get('acoesPlanejamentoProjeto');
    if (controle) {
      const acoesDoFormulario =
        (controle.value as IAcaoPlanejamentoProjeto[] | null) ?? [];

      controle.setValue(
        acoesDoFormulario.filter(
          acao => !idsAcoesFiltradas.has(Number(acao.codAcao))
        )
      );
      controle.markAsDirty();
      controle.markAsTouched();
      controle.updateValueAndValidity();
    }

    this.updateSelectAllState();
  }

  toggleSearch(): void {

    if (!this.podeEditar) {
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

    if (!this.podeEditar) {
      return;
    }

    this.filtroTexto = '';
    this.filtrarAcoes();
    this.searchInput?.nativeElement.focus();

  }

  filtrarAcoes(): void {

    const termo = this.filtroTexto
      ? this.filtroTexto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      : '';

    this.listaAcoesFiltradas = this.listaAcoes.filter(acao => {
      const nomeNormalizado = acao.nome
        ?.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      return nomeNormalizado?.includes(termo);
    });

    this.updateSelectAllState();

  }

  private carregarListaAcoes(

    preservarSelecaoAtual: boolean): void {

    this.acoesSubscription?.unsubscribe();

    const idAnos = this.obterAnosParaRequisicao();
    const idUos = this.currentFilter?.idsUos;
    const idFuncoes = this.currentFilter?.idsFuncoes;
    const idsProgramas = this.currentFilter?.idsProgramas;

    this.listaAcoes = [];
    this.listaAcoesFiltradas = [];

    if (!preservarSelecaoAtual) {
      // this.currentFilter.idsAcoes = [];
    }

    if (idAnos?.length === 0 || idUos?.length === 0) {
      if (this.currentFilter) {
        this.currentFilter.idsFuncoes = [];
        this.currentFilter.idsProgramas = [];
      }
      return;
    }

    this.carregandoAcoes = true;

    this.acoesSubscription =
      this._ppaloaIntegracaoService
        .listarAcoesPorProgramas(
          idFuncoes ?? [],
          idsProgramas ?? [],
          idAnos ?? [],
          idUos ?? []
        )
        .pipe(
          finalize(() => {
            this.carregandoAcoes = false;
          })
        )
        .subscribe({

          next: acoes => {

            this.listaAcoes = acoes ?? [];

            this.listaAcoesFiltradas = this.listaAcoes;

            this.carregandoAcoes = false;

          },
          error: erro => {

            this.carregandoAcoes = false;

            console.error(
              'Erro ao carregar as ações.',
              erro
            );

            this.listaAcoes = [];
            this.listaAcoesFiltradas = [];

          }
        })
      ;

  }

  ngOnDestroy(): void {
    this.acoesSubscription?.unsubscribe();
  }

  private updateSelectAllState(): void {
    this.selectAll = this.listaAcoesFiltradas.length > 0 &&
      this.listaAcoesFiltradas.every(acao => this.isSelecionado(acao));
  }

  get quantidadeAcoes(): number {
    return this.acoesPlanejamento?.length ?? 0;
  }

}
