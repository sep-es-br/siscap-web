import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { BehaviorSubject, catchError, filter, interval, map, Observable, of, Subject, switchMap, take, takeUntil, tap } from 'rxjs';

import { BaseHttpService } from '../http/base-http.service';

import { ProgramaFormModel } from '../../models/programa.model';
import { BotaoPropriedadesModel } from '../../../shared/components/botao/botao.model';

import { BotoesConfig } from '../../../shared/components/botao/botao.config';

import {
  IPrograma,
  IProgramaAssinaturaFases,
  IProgramaTableData,
} from '../../interfaces/programa.interface';
import { Post } from '../../interfaces/http-post.interface';
import { Put } from '../../interfaces/http-put.interface';

import { environment } from '../../../../environments/environment';
import { FilesService } from '../files/files.service';
import { ToastService } from '../toast/toast.service';
import { RequestStatus } from '../../enums/request-status.enum';
import { ProgramaFasesAssinaturaModel } from '../../models/programa-fases-assinatura.model';

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

  private readonly _idPrograma$: BehaviorSubject<number> =
    new BehaviorSubject<number>(0);

  public get idPrograma$(): BehaviorSubject<number> {
    return this._idPrograma$;
  }

  constructor(
    private readonly _http: HttpClient,
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
    deveExibirBotaoAutuarDesabilitado: boolean;
  }): Array<BotaoPropriedadesModel> {
    const botaoSalvar = BotoesConfig.gerarBotaoPropriedades('salvar');
    const botaoCancelar = BotoesConfig.gerarBotaoPropriedades('cancelar');
    const botaoSolicitarAutorizacao = BotoesConfig.gerarBotaoPropriedades(
      'solicitarAutorizacao'
    );
    const botaoAutuar = BotoesConfig.gerarBotaoPropriedades('autuar');
    const botaoAutuarDesabilitado =
      BotoesConfig.gerarBotaoPropriedades('autuarDisabled');

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
    } else if (config && config.deveExibirBotaoAutuarDesabilitado) {
      finalButtons = [botaoSalvar, botaoAutuarDesabilitado, botaoCancelar];
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

  public solicitarAutorizacoesPrograma(idPrograma: number): Observable<void> {
    return this._http.post<void>(
      `${this._url}/programa/${idPrograma}/edocs/solicitarassinaturas`,
      null
    );
  }

  public assinarAutorizacaoPrograma(
    idPrograma: number,
    userSub: string
  ): Observable<void> {
    return this._http.post<void>(
      `${this._url}/programa/${idPrograma}/edocs/assinar`,
      { subAssinante: userSub }
    );
  }

  public autuarPrograma(idPrograma: number): Observable<void> {
    return this._http.post<void>(
      `${this._url}/programa/${idPrograma}/edocs/autuar`,
      null
    );
  }

  public consultarFasesAssinaturaPrograma(
    idPrograma: number
  ): Observable<IProgramaAssinaturaFases[]> {
    return this._http.get<IProgramaAssinaturaFases[]>(
      `${this._url}/dic/edocs/fases/${idPrograma}`,
    );
  }

  public executarPollingFasesAssinaturaPrograma(
    idPrograma: number,
  ): Observable<ProgramaFasesAssinaturaModel[]> {
    const intervalo = 2000; //ms
    const $pararPolling = new Subject<void>();

    return interval(intervalo).pipe(
      switchMap(() =>
        this.consultarFasesAssinaturaPrograma(idPrograma)
        .pipe(
          tap(response => console.log('Resposta do Polling: ', response)),
          map(response => response.map(fase => new ProgramaFasesAssinaturaModel(fase))),
          catchError(err => {
            console.error('Erro ao tentar obter a fase do Programa durante o polling: ', err);
            return of([]);
          }),
        ),
      ),
      filter(lista => lista.length > 0),
      tap(lista => { return lista }),
      tap(lista => {
        const faseComErro = lista.find(f => f.erro);
        if (faseComErro) {
          if (faseComErro.msgAlertaExibir && faseComErro.msgAlertaExibir.length > 0) {
            this._toastService.showToast(
              'warning',
              faseComErro.msgAlertaExibir,
            );
          } else {
            this._toastService.showToast(
              'error',
              'Ocorreu um erro na integração com o E-Docs.',
            );
          }

          $pararPolling.next();
        }
      }),
      filter(lista => lista.every(fase => fase.finalizada)),
      take(1),
      tap((lista) => {
        $pararPolling.next();
        return lista;
      }),
      takeUntil($pararPolling),
    );
  }
  
}
