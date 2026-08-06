import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';

import { BehaviorSubject, filter, Observable, of, Subject, tap } from 'rxjs';

import { BaseHttpService } from '../http/base-http.service';

import { ProjetoFormModel } from '../../models/projeto.model';
import { RateioModel } from '../../models/rateio.model';
import { ValorModel } from '../../models/valor.model';
import { BotaoPropriedadesModel } from '../../../shared/components/botao/botao.model';

import { BotoesConfig } from '../../../shared/components/botao/botao.config';

import {
  IProjeto,
  IProjetoTableData,
} from '../../interfaces/projeto.interface';

import { TipoValorEnum } from '../../enums/tipo-valor.enum';

import { environment } from '../../../../environments/environment';
import { IProjetoIntegracaoEdocsFases } from '../../interfaces/projeto-integracao-edcos-fases.interface';
import { IEstruturaCamposComplementar } from '../../interfaces/estrutura.campo.complementar.dic.interface';
import { FilesService } from '../files/files.service';
import { LotacaoUsuarioEnum } from '../../enums/lotacao-usuario.enum';

@Injectable({
  providedIn: 'root',
})
export class ProjetosService extends BaseHttpService<
  IProjeto,
  IProjetoTableData
> {

  private _atualizarListaProjetos$ = new Subject<void>();
  atualizarListaProjetos$ = this._atualizarListaProjetos$.asObservable();

  notificarAtualizacaoLista() {
    this._atualizarListaProjetos$.next();
  }

  private readonly _url = `${environment.apiUrl}/projetos`;

  public protocoloAtualizado$ = new Subject<{ idProjeto: number; protocolo: string }>();
  private projetosAguardandoEdocsSubject = new BehaviorSubject<Set<number>>(new Set());
  public projetosAguardandoEdocs$ = this.projetosAguardandoEdocsSubject.asObservable();
  public complementacaoEdocsReenviado$ = new Subject<{ idProjeto: number; reenvioConcluido: boolean }>();

  adicionarProjetoAguardando(idProjeto: number): void {
    const atual = this.projetosAguardandoEdocsSubject.value;
    atual.add(idProjeto);
    this.projetosAguardandoEdocsSubject.next(new Set(atual));
  }

  removerProjetoAguardando(idProjeto: number): void {
    const atual = this.projetosAguardandoEdocsSubject.value;
    atual.delete(idProjeto);
    this.projetosAguardandoEdocsSubject.next(new Set(atual));
  }

  private readonly _idProjeto$: BehaviorSubject<number> =
    new BehaviorSubject<number>(0);

  public get idProjeto$(): BehaviorSubject<number> {
    return this._idProjeto$;
  }

  private _projetosEmAutuacao: BehaviorSubject<Set<number>> = new BehaviorSubject(new Set());

  constructor(
    private readonly _http: HttpClient,
    private filesService: FilesService,
  ) {
    super(_http, 'projetos');
  }

  public gerarBotoesAcaoListagem(): Array<BotaoPropriedadesModel> {
    const botaoCriar = BotoesConfig.gerarBotaoPropriedades('criar', {
      texto: 'Novo DIC',
    });

    return [botaoCriar];
  }

  public gerarBotoesAcaoFormulario(): Array<BotaoPropriedadesModel> {
    const botaoSalvar = BotoesConfig.gerarBotaoPropriedades('salvar');
    const botaoCancelar = BotoesConfig.gerarBotaoPropriedades('cancelar');
    const botaoEnviar = BotoesConfig.gerarBotaoPropriedades('enviar');
    return [botaoCancelar, botaoSalvar, botaoEnviar];
  }

  public gerarBotoesAcaoFormularioUsuarioProponenteResponsavel(): Array<BotaoPropriedadesModel> {
    const botaoVoltar = BotoesConfig.gerarBotaoPropriedades('voltar');
    const botaoSalvar = BotoesConfig.gerarBotaoPropriedades('salvar');
    const botaoAutuar = BotoesConfig.gerarBotaoPropriedades('autuarEdocs');
    const botaoArquivar = BotoesConfig.gerarBotaoPropriedades('arquivar');
    return [botaoVoltar, botaoSalvar, botaoAutuar, botaoArquivar];
  }

  public gerarBotoesAcaoFormularioProponente(): Array<BotaoPropriedadesModel> {
    const botaoSalvar = BotoesConfig.gerarBotaoPropriedades('salvar');
    const botaoVoltar = BotoesConfig.gerarBotaoPropriedades('voltar');
    const botaoEnviar = BotoesConfig.gerarBotaoPropriedades('enviar');
    return [botaoVoltar, botaoSalvar, botaoEnviar];
  }

  public gerarBotoesAcaoFormularioProponenteEmAnalise(): Array<BotaoPropriedadesModel> {
    const botaoSalvar = BotoesConfig.gerarBotaoPropriedades('salvar');
    const botaoAutuar = BotoesConfig.gerarBotaoPropriedades('autuarEdocs');
    const botaoArquivar = BotoesConfig.gerarBotaoPropriedades('arquivar');
    const botaoVoltar = BotoesConfig.gerarBotaoPropriedades('voltar');
    return [botaoSalvar, botaoAutuar, botaoArquivar, botaoVoltar];
  }

  public gerarBotoesAcaoFormularioProponenteEmAnaliseAposAutuacao(podeComplementar: boolean): Array<BotaoPropriedadesModel> {
    const botaoVoltar = BotoesConfig.gerarBotaoPropriedades('voltar');
    if (podeComplementar) {
      const botaoComplementar = BotoesConfig.gerarBotaoPropriedades('complementar');
      const botaoSolicitarParecer = BotoesConfig.gerarBotaoPropriedades('parecerestrategicoorcamentario');
      return [botaoVoltar, botaoSolicitarParecer, botaoComplementar]
    } else
      return [botaoVoltar];
  }

  public gerarBotoesAcaoFormularioArquivado(): Array<BotaoPropriedadesModel> {
    const botaoCancelar = BotoesConfig.gerarBotaoPropriedades('voltar');
    return [botaoCancelar];
  }

  public gerarBotoeAcaoVoltar(): Array<BotaoPropriedadesModel> {
    const botaoVoltar = BotoesConfig.gerarBotaoPropriedades('voltar');
    return [botaoVoltar];
  }

  public gerarBotoesAcaoResponderComplementacao(podeEditarDIC: boolean): Array<BotaoPropriedadesModel> {
    if (podeEditarDIC) {
      const botaoSalvar = BotoesConfig.gerarBotaoPropriedades('salvar');
      const botaoCancelar = BotoesConfig.gerarBotaoPropriedades('cancelar');
      const botaoAutuar = BotoesConfig.gerarBotaoPropriedades('autuarEdocs');
      return [botaoCancelar, botaoSalvar, botaoAutuar];
    }
    const botaoCancelar = BotoesConfig.gerarBotaoPropriedades('cancelar');
    return [botaoCancelar];
  }

  public gerarBotoesAcaoParecerEstrategicoOrcamentario(): Array<BotaoPropriedadesModel> {
    const botoes = [
      BotoesConfig.gerarBotaoPropriedades('cancelar'),
      BotoesConfig.gerarBotaoPropriedades('salvarparecer'),
      BotoesConfig.gerarBotaoPropriedades('efetivarparecerestrategicoorcamentario')
    ];
    return botoes;
  }

  public gerarBotoesAcaoParecerGEOC(lotacaoUsuario: LotacaoUsuarioEnum): Array<BotaoPropriedadesModel> {

    const botoes = [
      BotoesConfig.gerarBotaoPropriedades('cancelar'),
      BotoesConfig.gerarBotaoPropriedades('salvarparecer'),
      BotoesConfig.gerarBotaoPropriedades('capturarparecerGEOC'),
    ];

    return botoes;

  }

  public gerarBotoesAcaoEntgranharPareceresProcessoEdocs(): Array<BotaoPropriedadesModel> {
    const botaoEntranharPareceres = BotoesConfig.gerarBotaoPropriedades('entranharPareceresProcessoEdocs');
    const botaoCancelar = BotoesConfig.gerarBotaoPropriedades('cancelar');
    return [botaoCancelar, botaoEntranharPareceres];
  }

  public gerarBotoesAcaoParecereGEOCEdocs(): Array<BotaoPropriedadesModel> {
    const botaoEntranharPareceres = BotoesConfig.gerarBotaoPropriedades('entranharParecerGEOCdocs');
    const botaoCancelar = BotoesConfig.gerarBotaoPropriedades('cancelar');
    return [botaoCancelar, botaoEntranharPareceres];
  }

  public gerarBotoeAcaoVoltarContextoParecerSep(): Array<BotaoPropriedadesModel> {
    const botaoSolicitarParecer = BotoesConfig.gerarBotaoPropriedades('parecerestrategicoorcamentario');
    const botaoVoltar = BotoesConfig.gerarBotaoPropriedades('voltar');
    return [botaoVoltar, botaoSolicitarParecer];
  }

  public construirProjetoModelRateio(
    idMicrorregioesList: Array<number>,
    valorEstimado: number
  ): Array<RateioModel> {
    const percentualPorLocalidade = 100 / idMicrorregioesList.length;
    const quantiaPorLocalidade = valorEstimado / idMicrorregioesList.length;

    return idMicrorregioesList.map((idLocalidade) => {
      return new RateioModel({
        idLocalidade,
        percentual: percentualPorLocalidade,
        quantia: quantiaPorLocalidade,
      });
    });
  }

  public construirValorControleIdMicrorregioesList(
    rateioModelArray?: Array<RateioModel>
  ): Array<number> | null {
    if (!rateioModelArray) return null;

    return rateioModelArray.map((rateio) => rateio.idLocalidade);
  }

  public construirProjetoModelValor(valorEstimado: number): ValorModel {
    const tipoValor = TipoValorEnum.Estimado;
    const moedaValor = 'BRL';

    return new ValorModel({
      tipo: tipoValor,
      moeda: moedaValor,
      quantia: valorEstimado,
    });
  }

  public construirValorControleValorEstimado(
    valorModel?: ValorModel
  ): number | null {
    if (!valorModel) return null;

    return valorModel.quantia;
  }

  public post(
    body: ProjetoFormModel,
    isRascunho: boolean
  ): Observable<IProjeto> {
    return this._http.post<IProjeto>(
      `${this._url}?rascunho=${isRascunho}`,
      body
    );
  }

  public put(
    id: number,
    body: ProjetoFormModel,
    isRascunho: boolean,
    formData: FormData
  ): Observable<IProjeto> {

    formData.append(
      'projeto',
      new Blob(
        [JSON.stringify(body)],
        { type: 'application/json' }
      )
    );

    return this._http.put<IProjeto>(
      `${this._url}/${id}?rascunho=${isRascunho}`, formData
    );

  }

  public alterarStatusProjeto(id: number, status: string): Observable<string> {
    return this._http.put(
      `${this._url}/${id}/status`,
      { status },
      { responseType: 'text' }
    );
  }

  public enviarEmailRevisarProjeto(id: number,
    justificativa: string): Observable<string> {
    return this._http.post(
      `${this._url}/${id}/revisar?justificativa=${justificativa}`,
      { justificativa },
      { responseType: 'text' }
    );
  }

  public enviarEmailArquivarProjeto(id: number,
    justificativa: string,
    codigoMotivoArquivamento: string): Observable<string> {

    const payload = {
      justificativa: justificativa,
      codigoMotivoArquivamento: codigoMotivoArquivamento
    };

    return this._http.post(
      `${this._url}/${id}/arquivar`,
      payload,
      { responseType: 'text' }

    );

  }

  public enviarEmailAvisoComplementacaoProjeto(id: number, formCamposComplementar: IEstruturaCamposComplementar[]
  ): Observable<string> {

    const payload = formCamposComplementar
      .filter(item => (item.mensagemComplementacao || '').length > 0)
      .map(item => ({
        idComplemento: null,
        idCampo: item.name,
        descricaoCampo: item.label,
        descricaoComplemento: item.mensagemComplementacao
      }));

    return this._http.post(
      `${this._url}/${id}/complementar`,
      payload,
      { responseType: 'text' }

    );

  }

  public baixarDIC(id: number): Observable<any> {

    const downloadURL = `${this._url}/dic/${id}`;

    return this.filesService.requestPDF(downloadURL).pipe(
      tap((res) => {
        if (res instanceof HttpResponse) {
          this.filesService.downloadPDF(res as HttpResponse<Blob>);
        }
      })
    );

    // this.filesService.requestPDF(downloadURL).subscribe({
    //   next: (res) => {
    //     if (res instanceof HttpResponse) {
    //       const httpResponse = res as HttpResponse<Blob>;
    //       this.filesService.downloadPDF(httpResponse);
    //     }
    //   },
    // });

  }

  public autuarProjetoEdocs(
    id: number,
    body: ProjetoFormModel
  ): Observable<IProjeto> {
    this.iniciarAutuacao(id);
    return this._http.put<IProjeto>(
      `${this._url}/dic/edocs/autuar/${id}`, body
    );
  }

  public efetivarEnvioParecerEdocs(
    id: number,
    formData: FormData
  ): Observable<IProjeto> {
    this.iniciarAutuacao(id);
    return this._http.put<IProjeto>(
      `${this._url}/dic/edocs/capturarparecer/${id}`, formData
    );
  }

  public reentranharDicEdocs(
    id: number,
    body: ProjetoFormModel
  ): Observable<IProjeto> {
    this.iniciarAutuacao(id);
    return this._http.put<IProjeto>(
      `${this._url}/dic/edocs/reentranharDIC/${id}`, body,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`
        }
      }
    );
  }

  public efetivarEntranhamentoPareceresProjetoEdocs(
    id: number,
    body: ProjetoFormModel
  ): Observable<IProjeto> {
    this.iniciarAutuacao(id);
    return this._http.put<IProjeto>(
      `${this._url}/dic/edocs/entranharpareceres/${id}`, body
    );
  }


  public get projetosEmAutuacao$(): Observable<Set<number>> {
    return this._projetosEmAutuacao.asObservable();
  }

  public iniciarAutuacao(idProjeto: number): void {
    const set = new Set(this._projetosEmAutuacao.value);
    set.add(idProjeto);
    this._projetosEmAutuacao.next(set);
  }

  public consultarFasesIntegracaoEdcosProjeto(
    idProjeto: number
  ): Observable<IProjetoIntegracaoEdocsFases[]> {
    return this._http.get<IProjetoIntegracaoEdocsFases[]>(
      `${this._url}/dic/edocs/fases/${idProjeto}`);
  }

  public reEnviarEmailPedidoParecerProjeto(id: number):
    Observable<void> {
    return this._http.post<void>(
      `${this._url}/${id}/reenviar-email-pedido-parecer`,
      {}
    );
  }

  // listarAcoesPorProgramas(idPeriodo: number, idsProgramas: number[]): Observable<IOpcaoPlanejamento[]> {

  //   const usarMock = true;

  //   if (usarMock) {

  //     const acoesMock = [
  //       {
  //         id: 114,
  //         nome: 'RESERVA PARA O PAGAMENTO DE PESSOAL',
  //         idPeriodo: 1,
  //         idFuncao: 10,
  //         idPrograma: 27
  //       },
  //       {
  //         id: 1097,
  //         nome: 'REALIZAÇÃO DE CONCURSO PÚBLICO E PROCESSO SELETIVO',
  //         idPeriodo: 1,
  //         idFuncao: 10,
  //         idPrograma: 27
  //       }
  //     ]

  //     const acoesFiltradas: IOpcaoPlanejamento[] = acoesMock
  //       .filter(acao =>
  //         acao.idPeriodo === idPeriodo &&
  //         idsProgramas.includes(acao.idPrograma)
  //       )
  //       .map(acao => ({
  //         id: acao.id,
  //         nome: acao.id.toString().padStart(4, '0') + '-' + acao.nome
  //       }));

  //     return of(acoesFiltradas);

  //   }

  //   return this._http.get<IOpcaoPlanejamento[]>(
  //     `${this._url}/ppaloa/acoes/`
  //   );

  // }

  // listarProgramasPorFuncoes(idsAno: number[], idsFuncoes: number[], idsUos: number[]): Observable<IOpcaoPlanejamento[]> {

  //   const usarMock = false;

  //   if (usarMock) {

  //     const programasMock = [
  //       {
  //         id: 27,
  //         nome: 'GESTÃO ESTRATÉGICA DE PESSOAS',
  //         idAno: 2024,
  //         idUo: 1101,
  //         idFuncao: 1
  //       },
  //       {
  //         id: 61,
  //         nome: 'SAÚDE CIDADÃ',
  //         idAno: 2024,
  //         idUo: 1101,
  //         idFuncao: 1
  //       }
  //     ];

  //     const programasFiltrados: IOpcaoPlanejamento[] = programasMock
  //       .filter(programa =>
  //         idsAno.includes(programa.idAno) &&
  //         idsFuncoes.includes(programa.idFuncao) &&
  //         idsUos.includes(programa.idUo)
  //       )
  //       .map(programa => ({
  //         id: programa.id,
  //         nome: programa.id.toString().padStart(4, '0') + '-' + programa.nome
  //       }));

  //     return of(programasFiltrados);

  //   }

  //   return this._http.get<IOpcaoPlanejamento[]>(
  //     `${this._url}/ppaloa/programas/`
  //   );

  // }

  // listarFuncoesPpaLoa(idsAnos: number[], idsUos: number[]): Observable<IOpcaoPlanejamento[]> {

  //   const usarMock = true;

  //   if (usarMock) {

  //     const funcoesMock = [
  //       {
  //         id: 1,
  //         nome: 'LEGISLATIVA'
  //       },
  //       {
  //         id: 2,
  //         nome: 'JUDICIÁRIA'
  //       },
  //       {
  //         id: 3,
  //         nome: 'ESSENCIAL À JUSTIÇA'
  //       },
  //       {
  //         id: 4,
  //         nome: 'ADMINISTRAÇÃO'
  //       },
  //       {
  //         id: 5,
  //         nome: 'DEFESA NACIONAL'
  //       },
  //       {
  //         id: 6,
  //         nome: 'SEGURANÇA PÚBLICA'
  //       },
  //       {
  //         id: 7,
  //         nome: 'RELAÇÕES EXTERIORES'
  //       },
  //       {
  //         id: 8,
  //         nome: 'ASSISTÊNCIA SOCIAL'
  //       },
  //       {
  //         id: 9,
  //         nome: 'PREVIDÊNCIA SOCIAL'
  //       },
  //       {
  //         id: 10,
  //         nome: 'SAÚDE'
  //       }
  //     ] as IOpcaoPlanejamento[];

  //     return of(funcoesMock.map(funcao => ({
  //       id: funcao.id,
  //       nome: funcao.id.toString().padStart(2, '0') + '-' + funcao.nome
  //     })));

  //   }

  //   return this._http.get<IOpcaoPlanejamento[]>(
  //     `${this._url}/ppaloa/funcoes/`
  //   );

  // }

  // buscarPeriodoPpaVigente(): Observable<IPeriodoPlanejamento> {
  //   const usarMock = false;
  //   if (usarMock) {
  //     return of({
  //       id: 1,
  //       descricao: '2024-2027'
  //     } as IPeriodoPlanejamento);
  //   }
  //   return this._http.get<IPeriodoPlanejamento>(
  //     `${this._url}/ppaloa/bi/ppa`
  //   );
  // }

  // buscarDadosAcoes(idsAcoes: number[]): Observable<PlanejamentoAcao[]> {

  //   const usarMock = true;

  //   if (usarMock) {

  //     const acoesPlanejamento: PlanejamentoAcao[] = [
  //       {
  //         id: 2175,
  //         codigo: '2175',
  //         titulo: 'MANUTENÇÃO DAS UNIDADES CENTRAL E REGIONAIS',
  //         unidadeOrcamentaria: 'SEFAZ',
  //         programa: 'GESTÃO E SUPORTE EDUCACIONAL',
  //         funcao: '01 - EDUCAÇÃO',
  //         valorPpa: 60000,
  //         anoLoa: 2026,
  //         valorLoa: 15000,
  //         detalhamentoOrcamentarioLoa: [{
  //             codigoGnd: '3',
  //             codigoModalidade: '90',
  //             idUso: '0',
  //             fonte: '15000000',
  //             valor: 9750000.00
  //           },
  //           {
  //             codigoGnd: '4',
  //             codigoModalidade: '40',
  //             idUso: '0',
  //             fonte: '17000000',
  //             valor: 5250000.00
  //           } ]
  //       }
  //     ];

  //     return of(acoesPlanejamento);

  //   }

  //   return this._http.get<PlanejamentoAcao[]>(
  //     `${this._url}/ppaloa/acao/`
  //   );

  // }

  // listarAnosPpaLoa(): Observable<IOpcaoPlanejamento[]> {
  //   const usarMock = true;
  //   if (usarMock) {
  //     const anosMock = [
  //       {
  //         id: 2024,
  //         nome: '2024'
  //       },
  //       {
  //         id: 2025,
  //         nome: '2025'
  //       },
  //       {
  //         id: 2026,
  //         nome: '2026'
  //       },
  //       {
  //         id: 2027,
  //         nome: '2027'
  //       }
  //     ] as IOpcaoPlanejamento[];
  //     return of(anosMock.map(ano => ({
  //       id: ano.id,
  //       nome: ano.nome
  //     })));
  //   }
  //   return this._http.get<IOpcaoPlanejamento[]>(
  //     `${this._url}/ppaloa/anos/`
  //   );
  // }

  // listarUosPorAnosPpaLoa(idAnos: number[]): Observable<IOpcaoPlanejamento[]> {

  //   const usarMock = true;

  //   if (usarMock) {

  //     const uosMock = [
  //       {
  //         id: 1101,
  //         nome: 'ALEES'
  //       },
  //       {
  //         id: 2101,
  //         nome: 'TCEES'
  //       },
  //       {
  //         id: 3101,
  //         nome: 'TJEES'
  //       },
  //       {
  //         id: 3901,
  //         nome: 'FUNEPJ'
  //       },
  //       {
  //         id: 5101,
  //         nome: 'MPES'
  //       },
  //       {
  //         id: 5901,
  //         nome: 'FERIDL'
  //       },
  //       {
  //         id: 5902,
  //         nome: 'FUNEMP'
  //       },
  //       {
  //         id: 6101,
  //         nome: 'DPES'
  //       },
  //       {
  //         id: 6901,
  //         nome: 'FADEPES'
  //       },
  //       {
  //         id: 10101,
  //         nome: 'SCV'
  //       },
  //     ] as IOpcaoPlanejamento[];

  //     return of(uosMock.map(uo => ({
  //       id: uo.id,
  //       nome: uo.nome
  //     })));

  //   }

  //   return this._http.get<IOpcaoPlanejamento[]>(
  //     `${this._url}/ppaloa/uos/`
  //   );

  // }

}
