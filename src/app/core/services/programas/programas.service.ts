import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { BehaviorSubject, catchError, interval, map, Observable, switchMap, takeWhile, tap } from 'rxjs';

import { BaseHttpService } from '../http/base-http.service';

import { ProgramaFormModel } from '../../models/programa.model';
import { BotaoPropriedadesModel } from '../../../shared/components/botao/botao.model';

import { BotoesConfig } from '../../../shared/components/botao/botao.config';

import { IPrograma, IProgramaTableData } from '../../interfaces/programa.interface';
import { Post } from '../../interfaces/http-post.interface';
import { Put } from '../../interfaces/http-put.interface';

import { environment } from '../../../../environments/environment';
import { FilesService } from '../files/files.service';
import { ToastService } from '../toast/toast.service';
import { RequestStatus } from '../../enums/request-status.enum';
import { PollingService } from '../polling/polling.service';
import { IPollingFases } from '../../interfaces/polling.interface';
import { PollingFasesModel } from '../../models/polling.model';

@Injectable({
  providedIn: 'root',
})
export
  class ProgramasService
  extends BaseHttpService<IPrograma, IProgramaTableData>
  implements
    Post<IPrograma, ProgramaFormModel>,
    Put<IPrograma, ProgramaFormModel>
{
  private readonly _url = `${environment.apiUrl}/programas`;

  private readonly _idPrograma$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  private programasAguardandoEdocsSubject = new BehaviorSubject<Set<number>>(new Set());

  public programasAguardandoEdocs$ = this.programasAguardandoEdocsSubject.asObservable();

  public get idPrograma$(): BehaviorSubject<number> {
    return this._idPrograma$;
  }

  constructor(
    private readonly _http: HttpClient,
    private readonly _pollingService: PollingService,
    private filesService: FilesService,
    private _toastService: ToastService,
  ) {
    super(_http, 'programas');
  }

  public gerarBotoesAcaoListagem(): Array<BotaoPropriedadesModel> {
    const botaoCriar = BotoesConfig.gerarBotaoPropriedades('criar', {
      texto: 'Novo Programa',
    });

    return [botaoCriar];
  }

  public gerarBotoesAcaoFormulario(config: {
    deveExibirBotaoSolicitarAutorizacao: boolean;
    deveExibirBotaoAutuar: boolean;
  }): Array<BotaoPropriedadesModel> {
    const botaoSalvar = BotoesConfig.gerarBotaoPropriedades('salvar');
    const botaoCancelar = BotoesConfig.gerarBotaoPropriedades('cancelar');
    const botaoSolicitarAutorizacao = BotoesConfig.gerarBotaoPropriedades('solicitarAutorizacao');
    const botaoAutuar = BotoesConfig.gerarBotaoPropriedades('autuar');

    let finalButtons: Array<BotaoPropriedadesModel> = [
      botaoSalvar,
      botaoCancelar,
    ];

    if (
      config &&
      config.deveExibirBotaoSolicitarAutorizacao &&
      config.deveExibirBotaoAutuar
    ) {
      finalButtons = [
        botaoSalvar,
        botaoAutuar,
        botaoSolicitarAutorizacao,
        botaoCancelar,
      ];
    } else if (config && config.deveExibirBotaoSolicitarAutorizacao) {
      finalButtons = [botaoSalvar, botaoSolicitarAutorizacao, botaoCancelar];
    } else if (config && config.deveExibirBotaoAutuar) {
      finalButtons = [botaoSalvar, botaoAutuar, botaoCancelar];
    }

    return finalButtons;
  }

  public post(body: ProgramaFormModel): Observable<IPrograma> {
    return this._http.post<IPrograma>(this._url, body);
  }

  public put(id: number, body: ProgramaFormModel): Observable<IPrograma> {
    return this._http.put<IPrograma>(`${this._url}/${id}`, body);
  }

  public exportById(idPrograma: number, nomePrograma: string): BehaviorSubject<RequestStatus> {
    const $requestStatus = new BehaviorSubject<RequestStatus>(RequestStatus.EMPTY);

    const downloadURL = `${this._url}/programa/${idPrograma}/baixar-pdf`;
    this.filesService.requestPDF(downloadURL).subscribe({
      next: (res) => {
        if (res instanceof HttpResponse) {
          const httpResponse = res as HttpResponse<Blob>;
          const fileName = `SISCAP - ${nomePrograma}`;
          this.filesService.downloadPDF(httpResponse, fileName);

          this._toastService.showToast(
            'success',
            'Programa exportado com sucesso!',
          );
          
          $requestStatus.next(RequestStatus.SUCCESS);
          $requestStatus.complete();
        }
      },
      error: (err) => {
        console.error('Ocorreu um erro ao tentar exportar o Programa! \n', err);
        $requestStatus.next(RequestStatus.ERROR);
        this._toastService.showToast(
          'error',
          'Ocorreu um erro ao tentar exportar o Programa',
        );

        this._toastService.toastNotifier$.subscribe((isOpen) => {
          if (!isOpen) {
            $requestStatus.next(RequestStatus.EMPTY);
            $requestStatus.complete();
          }
        });
      },
    });

    return $requestStatus;
  }

  public adicionarProgramaAguardandoEdocs(idPrograma: number): void {
    const lista = this.programasAguardandoEdocsSubject.value;
    lista.add(idPrograma);
    this.programasAguardandoEdocsSubject.next(new Set(lista));
  }

  public removerProgramaAguardandoEdocs(idPrograma: number): void {
    const lista = this.programasAguardandoEdocsSubject.value;
    lista.delete(idPrograma);
    this.programasAguardandoEdocsSubject.next(new Set(lista));
  }

  public solicitarAutorizacoesPrograma(idPrograma: number): Observable<void> {
    return this._http.post<void>(
      `${this._url}/programa/${idPrograma}/edocs/solicitarassinaturas`,
      null
    );
  }

  public assinarAutorizacaoPrograma(
    idPrograma: number
  ): Observable<void> {
    return this._http.post<void>(
      `${this._url}/programa/${idPrograma}/edocs/assinar`,
      { },
    );
  }

  public recusarAutorizacaoPrograma(
    idPrograma: number,
    userSub: string,
  ): Observable<void> {
    return this._http.post<void>(
      `${this._url}/programa/${idPrograma}/edocs/recusaassinar`,
      { subAssinante: userSub },
    );
  }

  public autuarPrograma(idPrograma: number): Observable<void> {
    return this._http.post<void>(
      `${this._url}/programa/${idPrograma}/edocs/autuar`,
      null
    );
  }

  public consultarFasesPrograma(idPrograma: number): Observable<IPollingFases[]> {
    return this._pollingService.consultarFasesEntity(idPrograma, 'programas');
  }

  public executarPollingFasesProgramas(idPrograma: number): Observable<PollingFasesModel[]> {
    return this._pollingService.executarPollingFasesEntity(idPrograma, 'programas');
  }
}
