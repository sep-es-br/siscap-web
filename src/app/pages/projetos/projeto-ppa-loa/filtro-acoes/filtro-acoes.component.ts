import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { finalize, Subscription, switchMap } from 'rxjs';

import { ProjetosService } from '../../../../core/services/projetos/projetos.service';

export interface IOpcaoPlanejamento {
  id: number;
  nome: string;
}

export interface IPeriodoPlanejamento {
  id: number;
  descricao: string;
}

export interface IChipPlanejamento {
  id: number;
  nome: string;
}

export interface IFiltroPlanejamento {
  idPeriodoPlanejamento: number | null;

  idsAreasTematicas: number[];
  idsProgramas: number[];
  idsAcoes: number[];

  chips: {
    areasTematicas: IChipPlanejamento[];
    programas: IChipPlanejamento[];
    acoes: IChipPlanejamento[];
  };
}

@Component({
  selector: 'siscap-filtro-acoes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule
  ],
  templateUrl: './filtro-acoes.component.html',
  styleUrl: './filtro-acoes.component.scss'
})
export class FiltroAcoesComponent
  implements OnInit, OnChanges, OnDestroy {

  @Output()
  apply = new EventEmitter<IFiltroPlanejamento>();

  @Output()
  close = new EventEmitter<void>();

  @Output()
  restaurar = new EventEmitter<void>();

  @Input()
  somenteLeitura = false;

  @Input()
  filtroAtual: Partial<IFiltroPlanejamento> | null = null;

  periodoPlanejamento: IPeriodoPlanejamento | null = null;

  areasTematicas: IOpcaoPlanejamento[] = [];
  programas: IOpcaoPlanejamento[] = [];
  acoes: IOpcaoPlanejamento[] = [];

  carregandoDadosIniciais = false;
  carregandoProgramas = false;
  carregandoAcoes = false;

  filtro: IFiltroPlanejamento = this.criarFiltroVazio();

  private componenteInicializado = false;

  private carregamentoInicialSubscription?: Subscription;
  private programasSubscription?: Subscription;
  private acoesSubscription?: Subscription;

  constructor(
    private readonly _projetosService: ProjetosService
  ) {}

  ngOnInit(): void {
    this.componenteInicializado = true;

    this.inicializarFiltro();
    this.carregarDadosIniciais();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      this.componenteInicializado &&
      changes['filtroAtual'] &&
      !changes['filtroAtual'].firstChange
    ) {
      this.inicializarFiltro();
      this.recarregarDependenciasDoFiltro();
    }
  }

  ngOnDestroy(): void {
    this.carregamentoInicialSubscription?.unsubscribe();
    this.programasSubscription?.unsubscribe();
    this.acoesSubscription?.unsubscribe();
  }

  /**
   * Inicializa o período fixo e carrega a lista inicial
   * de áreas temáticas.
   */
  private carregarDadosIniciais(): void {
    
    this.carregamentoInicialSubscription?.unsubscribe();

    this.carregandoDadosIniciais = true;

    this.carregamentoInicialSubscription =
      this._projetosService
        .buscarPeriodoPlanejamentoVigente()
        .pipe(
          switchMap(periodo => {

            this.periodoPlanejamento = periodo;
            this.filtro.idPeriodoPlanejamento = periodo.id;

            return this._projetosService
              .listarAreasTematicas(periodo.id);

          }),
          finalize(() => {
            this.carregandoDadosIniciais = false;
          })
        )
        .subscribe({
          next: areasTematicas => {

            this.areasTematicas = areasTematicas ?? [];

            this.filtro.idsAreasTematicas =
              this.manterSomenteIdsValidos(
                this.filtro.idsAreasTematicas,
                this.areasTematicas
              );

            if (this.filtro.idsAreasTematicas.length > 0) {
              this.carregarProgramas(true);
            }

          },
          error: erro => {
            console.error(
              'Erro ao carregar os dados iniciais do planejamento.',
              erro
            );

            this.areasTematicas = [];
            this.programas = [];
            this.acoes = [];
          }
        });
  }

  /**
   * Executado quando o usuário seleciona ou remove
   * uma Área Temática.
   */
  onAreasTematicasChange(): void {
    this.filtro.idsAreasTematicas =
      this.normalizarIds(this.filtro.idsAreasTematicas);

    this.filtro.idsProgramas = [];
    this.filtro.idsAcoes = [];

    this.programas = [];
    this.acoes = [];

    if (this.filtro.idsAreasTematicas.length === 0) {
      return;
    }

    this.carregarProgramas(false);
  }

  /**
   * Executado quando o usuário seleciona ou remove
   * um Programa.
   */
  onProgramasChange(): void {
    this.filtro.idsProgramas =
      this.normalizarIds(this.filtro.idsProgramas);

    this.filtro.idsAcoes = [];
    this.acoes = [];

    if (this.filtro.idsProgramas.length === 0) {
      return;
    }

    this.carregarAcoes(false);
  }

  /**
   * Consulta os programas pertencentes às áreas
   * temáticas selecionadas.
   */
  private carregarProgramas(
    preservarSelecaoAtual: boolean
  ): void {
    this.programasSubscription?.unsubscribe();

    const idPeriodo = this.filtro.idPeriodoPlanejamento;
    const idsAreas = this.normalizarIds(
      this.filtro.idsAreasTematicas
    );

    this.programas = [];
    this.acoes = [];

    if (!preservarSelecaoAtual) {
      this.filtro.idsProgramas = [];
      this.filtro.idsAcoes = [];
    }

    if (idPeriodo == null || idsAreas.length === 0) {
      this.filtro.idsProgramas = [];
      this.filtro.idsAcoes = [];
      return;
    }

    this.carregandoProgramas = true;

    this.programasSubscription =
      this._projetosService
        .listarProgramasPorAreas(
          idPeriodo,
          idsAreas
        )
        .pipe(
          finalize(() => {
            this.carregandoProgramas = false;
          })
        )
        .subscribe({
          next: programas => {

            this.programas = programas ?? [];

            this.filtro.idsProgramas =
              preservarSelecaoAtual
                ? this.manterSomenteIdsValidos(
                    this.filtro.idsProgramas,
                    this.programas
                  )
                : [];

            if (
              preservarSelecaoAtual &&
              this.filtro.idsProgramas.length > 0
            ) {
              this.carregarAcoes(true);
            } else {
              this.filtro.idsAcoes = [];
              this.acoes = [];
            }
          },
          error: erro => {
            console.error(
              'Erro ao carregar os programas.',
              erro
            );

            this.programas = [];
            this.acoes = [];

            this.filtro.idsProgramas = [];
            this.filtro.idsAcoes = [];
          }
        });
  }

  /**
   * Consulta as ações pertencentes aos programas
   * selecionados.
   */
  private carregarAcoes(
    preservarSelecaoAtual: boolean
  ): void {
    this.acoesSubscription?.unsubscribe();

    const idPeriodo = this.filtro.idPeriodoPlanejamento;
    const idsProgramas = this.normalizarIds(
      this.filtro.idsProgramas
    );

    this.acoes = [];

    if (!preservarSelecaoAtual) {
      this.filtro.idsAcoes = [];
    }

    if (idPeriodo == null || idsProgramas.length === 0) {
      this.filtro.idsAcoes = [];
      return;
    }

    this.carregandoAcoes = true;

    this.acoesSubscription =
      this._projetosService
        .listarAcoesPorProgramas(
          idPeriodo,
          idsProgramas
        )
        .pipe(
          finalize(() => {
            this.carregandoAcoes = false;
          })
        )
        .subscribe({
          next: acoes => {
            
            this.acoes = acoes ?? [];

            this.filtro.idsAcoes =
              preservarSelecaoAtual
                ? this.manterSomenteIdsValidos(
                    this.filtro.idsAcoes,
                    this.acoes
                  )
                : [];
          },
          error: erro => {
            console.error(
              'Erro ao carregar as ações.',
              erro
            );

            this.acoes = [];
            this.filtro.idsAcoes = [];
          }
        });
  }

  /**
   * Recarrega os programas e ações quando a modal
   * recebe um filtro já preenchido.
   */
  private recarregarDependenciasDoFiltro(): void {
    if (!this.periodoPlanejamento) {
      return;
    }

    this.filtro.idPeriodoPlanejamento =
      this.periodoPlanejamento.id;

    if (this.filtro.idsAreasTematicas.length > 0) {
      this.carregarProgramas(true);
      return;
    }

    this.programas = [];
    this.acoes = [];

    this.filtro.idsProgramas = [];
    this.filtro.idsAcoes = [];
  }

  resetar(): void {
    this.programasSubscription?.unsubscribe();
    this.acoesSubscription?.unsubscribe();

    this.programas = [];
    this.acoes = [];

    this.filtro = {
      ...this.criarFiltroVazio(),
      idPeriodoPlanejamento:
        this.periodoPlanejamento?.id ?? null
    };

    this.restaurar.emit();
  }

  applyFilter(): void {
    this.montarChipsFiltro();

    this.apply.emit({
      idPeriodoPlanejamento:
        this.filtro.idPeriodoPlanejamento,

      idsAreasTematicas: [
        ...this.filtro.idsAreasTematicas
      ],

      idsProgramas: [
        ...this.filtro.idsProgramas
      ],

      idsAcoes: [
        ...this.filtro.idsAcoes
      ],

      chips: {
        areasTematicas: [
          ...this.filtro.chips.areasTematicas
        ],
        programas: [
          ...this.filtro.chips.programas
        ],
        acoes: [
          ...this.filtro.chips.acoes
        ]
      }
    });
  }

  fecharModal(): void {
    this.close.emit();
  }

  /**
   * Mantido como compatibilidade caso algum template
   * antigo ainda utilize fechar().
   */
  fechar(): void {
    this.fecharModal();
  }

  private inicializarFiltro(): void {
    const filtroAtual = this.filtroAtual;

    this.filtro = {
      idPeriodoPlanejamento:
        filtroAtual?.idPeriodoPlanejamento ?? null,

      idsAreasTematicas: this.normalizarIds(
        filtroAtual?.idsAreasTematicas
      ),

      idsProgramas: this.normalizarIds(
        filtroAtual?.idsProgramas
      ),

      idsAcoes: this.normalizarIds(
        filtroAtual?.idsAcoes
      ),

      chips: {
        areasTematicas: [],
        programas: [],
        acoes: []
      }
    };
  }

  private criarFiltroVazio(): IFiltroPlanejamento {
    return {
      idPeriodoPlanejamento: null,
      idsAreasTematicas: [],
      idsProgramas: [],
      idsAcoes: [],

      chips: {
        areasTematicas: [],
        programas: [],
        acoes: []
      }
    };
  }

  private montarChipsFiltro(): void {
    this.filtro.chips = {
      areasTematicas: this.obterOpcoesSelecionadas(
        this.areasTematicas,
        this.filtro.idsAreasTematicas
      ),

      programas: this.obterOpcoesSelecionadas(
        this.programas,
        this.filtro.idsProgramas
      ),

      acoes: this.obterOpcoesSelecionadas(
        this.acoes,
        this.filtro.idsAcoes
      )
    };
  }

  private obterOpcoesSelecionadas(
    opcoes: IOpcaoPlanejamento[],
    idsSelecionados: number[]
  ): IChipPlanejamento[] {
    const ids = new Set(
      this.normalizarIds(idsSelecionados)
    );

    return opcoes
      .filter(opcao => ids.has(Number(opcao.id)))
      .map(opcao => ({
        id: Number(opcao.id),
        nome: opcao.nome
      }));
  }

  private manterSomenteIdsValidos(
    idsSelecionados: number[] | null | undefined,
    opcoesDisponiveis: IOpcaoPlanejamento[]
  ): number[] {
    const idsValidos = new Set(
      opcoesDisponiveis.map(opcao => Number(opcao.id))
    );

    return this.normalizarIds(idsSelecionados)
      .filter(id => idsValidos.has(id));
  }

  private normalizarIds(
    ids: number[] | null | undefined
  ): number[] {
    if (!Array.isArray(ids)) {
      return [];
    }

    return Array.from(
      new Set(
        ids
          .map(id => Number(id))
          .filter(id => !Number.isNaN(id))
      )
    );
  }
}