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

import { PpaloaIntegracaoBiService } from '../../../../core/services/ppaloa-integracao-bi/ppaloa-integracao-bi.service';

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

  periodoPlanejamento: IPeriodoPlanejamento | null;
  idPeriodoPlanejamento: number | null;

  idsAnos: number[];
  idsUos: number[];
  idsFuncoes: number[];
  idsProgramas: number[];
  // idsAcoes: number[];

  chips: {
    anos: IChipPlanejamento[];
    uos: IChipPlanejamento[];
    funcoes: IChipPlanejamento[];
    programas: IChipPlanejamento[];
    acoes: IChipPlanejamento[];
  };

}

@Component({
  selector: 'siscap-filtro-ppa-loa',
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

  anos: IOpcaoPlanejamento[] = [];
  uos: IOpcaoPlanejamento[] = [];
  funcoes: IOpcaoPlanejamento[] = [];
  programas: IOpcaoPlanejamento[] = [];
  acoes: IOpcaoPlanejamento[] = [];

  carregandoDadosIniciais = false;
  carregandoProgramas = false;
  carregandoAcoes = false;
  carregandoUos = false;
  carregandoFuncoes = false;

  filtro: IFiltroPlanejamento = this.criarFiltroVazio();

  private componenteInicializado = false;

  private carregamentoInicialSubscription?: Subscription;
  private programasSubscription?: Subscription;
  // private acoesSubscription?: Subscription;
  private uosSubscription?: Subscription;
  private funcoesSubscription?: Subscription;

  anoEscolhido: boolean = false

  constructor(
    private readonly _ppaloaIntegracaoService: PpaloaIntegracaoBiService
  ) { }

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
    // this.acoesSubscription?.unsubscribe();
    this.uosSubscription?.unsubscribe();
  }

  /**
   * Inicializa o período fixo e carrega a lista inicial
   * de funcoes.
   */
  private carregarDadosIniciais(): void {

    this.carregamentoInicialSubscription?.unsubscribe();

    this.carregandoDadosIniciais = true;

    this.carregamentoInicialSubscription =
      this._ppaloaIntegracaoService
        .buscarPeriodoPpaVigente()
        .pipe(
          switchMap( periodo => {
            this.periodoPlanejamento = periodo;
            this.filtro.idPeriodoPlanejamento = periodo.id;
            return this._ppaloaIntegracaoService.listarAnosPpaLoa();
          }),
          finalize(() => {
            this.carregandoDadosIniciais = false;
          })
        )
        .subscribe({
          next: anos => {

            this.anos = anos ?? [];

            this.filtro.idsAnos =
              this.manterSomenteIdsValidos(
                this.filtro.idsAnos,
                this.anos
              );

            if (this.filtro.idsUos.length > 0) {
              this.carregarUos(true);
            }
           
            if (this.filtro.idsAnos.length > 0) {
              this.carregarProgramas(true);
            }

            // if (this.filtro.idsAcoes.length > 0) {
            //   this.carregarAcoes(true);
            // }

            if (this.filtro.idsAnos.length > 0) {
              this.carregarFuncoes(true);
            }

          },
          error: erro => {
            console.error(
              'Erro ao carregar os dados iniciais do planejamento.',
              erro
            );
            this.anos = [];
            this.uos = [];
            this.funcoes = [];
            this.programas = [];
            this.acoes = [];
          }
        });
  }

  onAnoChange(idAno: number | null): void {
    
    this.filtro.idsAnos = idAno != null ? [idAno] : [];

    this.filtro.idsAnos =
      this.normalizarIds(this.filtro.idsAnos);

    this.filtro.idsUos = [];
    this.filtro.idsProgramas = [];
    // this.filtro.idsAcoes = [];

    this.uos = []
    this.programas = [];
    this.acoes = [];

    if (this.filtro.idsAnos.length === 0) {
      return;
    }

    this.carregarUos(false);

  }

  onUoChange(): void {

    this.filtro.idsUos =
      this.normalizarIds(this.filtro.idsUos);

    this.filtro.idsFuncoes = [];
    this.filtro.idsProgramas = [];
    // this.filtro.idsAcoes = [];

    this.funcoes = [];
    this.programas = [];
    this.acoes = [];

    if (this.filtro.idsUos.length === 0) {
      return;
    }

    this.carregarFuncoes(false);

  }

  /**
   * Executado quando o usuário seleciona ou remove
   * uma Função.
   */
  onFuncoesChange(): void {

    this.filtro.idsFuncoes =
      this.normalizarIds(this.filtro.idsFuncoes);

    this.filtro.idsProgramas = [];
    // this.filtro.idsAcoes = [];

    this.programas = [];
    this.acoes = [];

    if (this.filtro.idsFuncoes.length === 0) {
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

    // this.filtro.idsAcoes = [];
    this.acoes = [];

    if (this.filtro.idsProgramas.length === 0) {
      return;
    }

    // this.carregarAcoes(false);

  }

  /**
   * Consulta os programas pertencentes às funcoes
   * selecionadas.
   */
  private carregarProgramas(
    preservarSelecaoAtual: boolean
  ): void {

    this.programasSubscription?.unsubscribe();

    const idsAnos = this.normalizarIds(this.filtro.idsAnos);
    const idsFuncoes = this.normalizarIds(this.filtro.idsFuncoes);
    const idsUos = this.normalizarIds(this.filtro.idsUos);

    this.programas = [];
    this.acoes = [];

    if (!preservarSelecaoAtual) {
      this.filtro.idsProgramas = [];
      // this.filtro.idsAcoes = [];
    }

    if (idsFuncoes.length === 0 || idsAnos.length === 0 || idsUos.length === 0) {
      this.filtro.idsProgramas = [];
      // this.filtro.idsAcoes = [];
      return;
    }

    this.carregandoProgramas = true;

    this.programasSubscription =
      this._ppaloaIntegracaoService
        .listarProgramasPorFuncoes(idsAnos, idsFuncoes, idsUos)
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
              // this.carregarAcoes(true);
            } else {
              // this.filtro.idsAcoes = [];
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
            // this.filtro.idsAcoes = [];
          }
        });

  }

  /**
   * Consulta as ações pertencentes aos programas
   * selecionados.
   */
  // private carregarAcoes(

  //   preservarSelecaoAtual: boolean): void {

  //   this.acoesSubscription?.unsubscribe();

  //   const idFuncoes = this.normalizarIds(this.filtro.idsFuncoes);
  //   const idsProgramas = this.normalizarIds(this.filtro.idsProgramas);
  //   const idAnos = this.normalizarIds(this.filtro.idsAnos);
  //   const idUos = this.normalizarIds(this.filtro.idsUos);

  //   this.acoes = [];

  //   console.log('entrou aqui')

  //   if (!preservarSelecaoAtual) {
  //     // this.filtro.idsAcoes = [];
  //   }

  //   if ( idAnos.length === 0 || idUos.length === 0 ) {
  //     // this.filtro.idsAcoes = [];
  //     return;
  //   }

  //   this.carregandoAcoes = true;

  //   this.acoesSubscription =
  //     this._ppaloaIntegracaoService
  //       .listarAcoesPorProgramas(
  //         idFuncoes,
  //         idsProgramas,
  //         idAnos,
  //         idUos
  //       )
  //       .pipe(
  //         finalize(() => {
  //           this.carregandoAcoes = false;
  //         })
  //       )
  //       .subscribe({
  //         next: acoes => {

  //           console.log('acoes carregadas :', acoes)

  //           this.acoes = acoes ?? [];

  //           // this.filtro.idsAcoes =
  //           //   preservarSelecaoAtual
  //           //     ? this.manterSomenteIdsValidos(
  //           //       this.filtro.idsAcoes,
  //           //       this.acoes
  //           //     )
  //           //     : [];

  //         },
  //         error: erro => {
  //           console.error(
  //             'Erro ao carregar as ações.',
  //             erro
  //           );

  //           this.acoes = [];
  //           // this.filtro.idsAcoes = [];
  //         }
  //       })
  //       ;

  // }

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

    if (this.filtro.idsFuncoes.length > 0) {
      this.carregarProgramas(true);
      return;
    }

    this.programas = [];
    this.acoes = [];

    this.filtro.idsProgramas = [];
    // this.filtro.idsAcoes = [];
  }

  resetar(): void {

    this.programasSubscription?.unsubscribe();
    // this.acoesSubscription?.unsubscribe();

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

      periodoPlanejamento:
        this.filtro.periodoPlanejamento,

      idPeriodoPlanejamento:
        this.filtro.idPeriodoPlanejamento,

      idsAnos: [
        ...this.filtro.idsAnos
      ],

      idsUos: [
        ...this.filtro.idsUos
      ],

      idsFuncoes: [
        ...this.filtro.idsFuncoes
      ],

      idsProgramas: [
        ...this.filtro.idsProgramas
      ],

      // idsAcoes: [
      //   ...this.filtro.idsAcoes
      // ],

      chips: {
        anos: [
          ...this.filtro.chips.anos
        ],
        uos: [
          ...this.filtro.chips.uos
        ],
        funcoes: [
          ...this.filtro.chips.funcoes
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

      periodoPlanejamento:
        filtroAtual?.periodoPlanejamento ?? null,

      idPeriodoPlanejamento:
        filtroAtual?.idPeriodoPlanejamento ?? null,

      idsAnos: this.normalizarIds(
        filtroAtual?.idsAnos
      ),

      idsUos: this.normalizarIds(
        filtroAtual?.idsUos
      ),

      idsFuncoes: this.normalizarIds(
        filtroAtual?.idsFuncoes
      ),

      idsProgramas: this.normalizarIds(
        filtroAtual?.idsProgramas
      ),

      // idsAcoes: this.normalizarIds(
      //   filtroAtual?.idsAcoes
      // ),

      chips: {
        anos: [],
        uos: [],
        funcoes: [],
        programas: [],
        acoes: []
      }

    };

    if(this.filtro.idsAnos?.length == 0){
      this.anoEscolhido = false
    }else{
      this.anoEscolhido = true
      this.carregarUos(true);
    }

  }

  private criarFiltroVazio(): IFiltroPlanejamento {
    return {

      periodoPlanejamento: null,
      idPeriodoPlanejamento: null,
      idsAnos: [],
      idsUos: [],
      idsFuncoes: [],
      idsProgramas: [],
      // idsAcoes: [],

      chips: {
        anos: [],
        uos: [],
        funcoes: [],
        programas: [],
        acoes: []
      }

    };
  }

  private montarChipsFiltro(): void {

    this.filtro.chips = {

      anos: this.obterOpcoesSelecionadas(
        this.anos,
        this.filtro.idsAnos
      ),

      uos: this.obterOpcoesSelecionadas(
        this.uos,
        this.filtro.idsUos
      ),

      funcoes: this.obterOpcoesSelecionadas(
        this.funcoes,
        this.filtro.idsFuncoes
      ),

      programas: this.obterOpcoesSelecionadas(
        this.programas,
        this.filtro.idsProgramas
      ),

      acoes: this.obterOpcoesSelecionadas(
        this.acoes,
        []
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

  private carregarUos(
    preservarSelecaoAtual: boolean
  ): void {

    this.uosSubscription?.unsubscribe();

    const idsAnos = this.normalizarIds(this.filtro.idsAnos);

    this.uos = [];
    this.programas = [];
    this.acoes = [];

    if (!preservarSelecaoAtual) {
      this.filtro.idsUos = [];
      this.filtro.idsProgramas = [];
      // this.filtro.idsAcoes = [];
    }

    if (idsAnos.length === 0) {
      this.filtro.idsProgramas = [];
      // this.filtro.idsAcoes = [];
      return;
    }

    this.carregandoUos = true;

    this.uosSubscription =
      this._ppaloaIntegracaoService
        .listarUosPorAnosPpaLoa(idsAnos)
        .pipe(
          finalize(() => {
            this.carregandoUos = false;
          })
        )
        .subscribe({
          next: uos => {

            this.uos = uos ?? [];

            this.filtro.idsUos =
              preservarSelecaoAtual
                ? this.manterSomenteIdsValidos(
                  this.filtro.idsUos,
                  this.uos
                )
                : [];

            if ( preservarSelecaoAtual && this.filtro.idsUos.length > 0 ) {
              this.carregarProgramas(true);
            } else {
              this.filtro.idsUos = [];
            }

          },
          error: erro => {
            console.error(
              'Erro ao carregar as UOS.',
              erro
            );

            this.uos = [];
            this.programas = [];
            this.acoes = [];

            this.filtro.idsUos = [];
            this.filtro.idsProgramas = [];
            // this.filtro.idsAcoes = [];

          }
        });

  }

  private carregarFuncoes(
    preservarSelecaoAtual: boolean
  ): void {

    this.funcoesSubscription?.unsubscribe();

    const idsAnos = this.normalizarIds(this.filtro.idsAnos);
    const idsUos = this.normalizarIds(this.filtro.idsUos);

    this.programas = [];
    this.acoes = [];

    if (!preservarSelecaoAtual) {
      this.filtro.idsProgramas = [];
      // this.filtro.idsAcoes = [];
    }

    // if (idsUos.length === 0 || idsAnos.length === 0) {
    //   this.filtro.idsAnos = [];
    //   this.filtro.idsUos = [];
    //   return;
    // }

    this.carregandoFuncoes = true;

    this.uosSubscription =
      this._ppaloaIntegracaoService
        .listarFuncoesPpaLoa(idsAnos, idsUos)
        .pipe(
          finalize(() => {
            this.carregandoFuncoes = false;
          })
        )
        .subscribe({
          next: funcoes => {

            this.funcoes = funcoes ?? [];

            this.filtro.idsFuncoes =
              preservarSelecaoAtual
                ? this.manterSomenteIdsValidos(
                  this.filtro.idsFuncoes,
                  this.funcoes
                )
                : [];

            if (
              preservarSelecaoAtual &&
              this.filtro.idsFuncoes.length > 0
            ) {

              console.log('passou aqui no carregar funcoes.. ')

              this.carregarProgramas(true);

            } else {
              this.filtro.idsFuncoes = [];
            }

          },
          error: erro => {

            console.error(
              'Erro ao carregar as Funcoes.',
              erro
            );

            this.uos = [];
            this.programas = [];
            this.acoes = [];

            this.filtro.idsUos = [];
            this.filtro.idsProgramas = [];
            // this.filtro.idsAcoes = [];

          }
        });

  }

}