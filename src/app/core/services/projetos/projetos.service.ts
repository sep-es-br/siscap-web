import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';

import { BehaviorSubject, Observable, Subject } from 'rxjs';

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

  public gerarBotoesAcaoParecerGEOC( lotacaoUsuario: LotacaoUsuarioEnum ): Array<BotaoPropriedadesModel> {
    
    const botoes = [
      BotoesConfig.gerarBotaoPropriedades('cancelar'),
      BotoesConfig.gerarBotaoPropriedades('salvarparecer'),
      BotoesConfig.gerarBotaoPropriedades('capturarparecerGEOC'),
    ];

    if( lotacaoUsuario == LotacaoUsuarioEnum.SUBCAP )
      botoes.push(BotoesConfig.gerarBotaoPropriedades('efetivarparecerestrategicoorcamentario'))

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
    isRascunho: boolean
  ): Observable<IProjeto> {
    return this._http.put<IProjeto>(
      `${this._url}/${id}?rascunho=${isRascunho}`, body
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

  public baixarDIC(id: number): void {
    const downloadURL = `${this._url}/dic/${id}`;
    this.filesService.requestPDF(downloadURL).subscribe({
      next: (res) => {
        if (res instanceof HttpResponse) {
          const httpResponse = res as HttpResponse<Blob>;
          this.filesService.downloadPDF(httpResponse);
        }
      },
    });
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
    body: ProjetoFormModel
  ): Observable<IProjeto> {
    this.iniciarAutuacao(id);
    return this._http.put<IProjeto>(
      `${this._url}/dic/edocs/capturarparecer/${id}`, body
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

}
