import { Component, ElementRef, Input, TrackByFunction, ViewChild } from '@angular/core';
import { NgbModal, NgbModalModule, NgbPopoverModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TemplatesModule } from '../../../shared/templates/templates.module';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { PpaLoaChipComponent } from './ppa-loa-chip/ppa-loa-chip.component';
import { FiltroAcoesComponent, IFiltroPlanejamento, IOpcaoPlanejamento, IPeriodoPlanejamento } from './ppa-loa-filtro/filtro-acoes.component';
import { finalize, Subscription } from 'rxjs';
import { ToastService } from '../../../core/services/toast/toast.service';
import { PpaloaIntegracaoBiService } from '../../../core/services/ppaloa-integracao-bi/ppaloa-integracao-bi.service';
import { IAcaoPlanejamentoProjeto } from '../../../core/interfaces/acao-planejamento-projeto.interface';
import { CheckboxModule } from 'primeng/checkbox';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';

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
    NgSelectModule,
    NgbTooltipModule,
    NgbModalModule,
    NgbPopoverModule,
    TemplatesModule,
    Button,
    DialogModule,
    PpaLoaChipComponent,
    FiltroAcoesComponent,
    CheckboxModule,
    FormsModule],
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
  // quantidadeAcoes: number = 0;
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

  searchVisible: boolean = false;

  @ViewChild('searchInput')
  searchInput!: ElementRef<HTMLInputElement>;

  filtroTexto: string = '';

  private acoesSubscription?: Subscription;

  private acoesPlanejamentoBackup: IAcaoPlanejamentoProjeto[] = [];

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

    return codigo.replace(/^0+(?=\d)/, '');

  }

  onNaoPrevistoPpaChange(event: Event): void {

    const input = event.currentTarget as HTMLInputElement;

    this.naoPrevistoPpa = input.checked;

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

    console.table(
      this.acoesPlanejamento.map(a => ({
        id: a.id,
        codigoAcao: a.codigoAcao,
        codigoPrograma: a.codigoPrograma,
        anoAcao: a.anoAcao,
        codigoUnidadeOrcamentaria: a.codigoUnidadeOrcamentaria
      }))
    );
    
    if (this.naoPrevistoPpa) {

      if (this.acoesPlanejamento.length > 0) {
        this.acoesPlanejamentoBackup =
          structuredClone(controleAcoes.value);
      }

      console.table(
        this.acoesPlanejamentoBackup.map(a => ({
          id: a.id,
          codigoAcao: a.codAcao,
          codigoPrograma: a.codPrograma,
          anoAcao: a.ano,
          codigoUnidadeOrcamentaria: a.codUo
        }))
      );
      
      this.acoesPlanejamento = [];

      controleAcoes?.setValue([]);

      this.initBaseChip()
  
    } else {
  
      // Restaura o que estava selecionado anteriormente
      // this.acoesPlanejamento =
      //   structuredClone(this.acoesPlanejamentoBackup);
  
      controleAcoes?.setValue(
        structuredClone(this.acoesPlanejamentoBackup)
      );

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

          this.listaAcoes = [];
          this.listaAcoesFiltradas = [];

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
        idPrograma: programa.id
      })),

      ...(this.currentFilter?.chips?.acoes ?? []).map((acao: any) => ({
        label: 'AÇÃO',
        value: acao.nome,
        type: 'filter',
        removable: true,
        idAcao: acao.id
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
      idsAcoes
    );

  }

  public toggleAcao(acao: IOpcaoPlanejamento) {

    if (this.isSelecionado(acao)) {
      this.acoesPlanejamento = this.acoesPlanejamento.filter(a =>
        !this.mesmaAcao(a, acao)
      );
      // this.quantidadeAcoes = this.acoesPlanejamento.length;
    } else {

      const idsAnos = [
        ...new Set(this.currentFilter?.idsAnos)
      ];

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
    return (this.acoesPlanejamento || []).some(i =>
      this.mesmaAcao(i, acao)
    );
  }

  private mesmaAcao(a: any, b: any): boolean {

    return Number(a.codigoAcao) === b.id;

  }

  toggleSelectAll(event: any): void {

    // let novasSelecoes = [...this.selecionados];

    // if (this.selectAll) {
    //   const novos = this.indicadoresFiltrados.filter(i => !this.isSelecionado(i));
    //   novasSelecoes = [...novasSelecoes, ...novos];
    // } else {
    //   const idsFiltrados = this.indicadoresFiltrados.map(i => i.idIndicador);
    //   novasSelecoes = novasSelecoes.filter(i => !idsFiltrados.includes(i.idIndicador));
    // }

    // this.selecionadosChange.emit(novasSelecoes);

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

    const idAnos = this.currentFilter?.idsAnos;
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
