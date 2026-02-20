import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, switchMap, takeWhile, tap, timer } from 'rxjs';
import { IPollingFases } from '../../interfaces/polling.interface';
import { environment } from '../../../../environments/environment';
import { PollingFasesModel } from '../../models/polling.model';
import { ToastService } from '../toast/toast.service';

@Injectable({
  providedIn: 'root'
})
export class PollingService {
  private readonly _url = `${environment.apiUrl}`;
  
  constructor(
    private readonly _http: HttpClient,
    private readonly _toastService: ToastService,
  ) {}

  public consultarFasesEntity(
    idEntity: number,
    entity: 'projetos' | 'programas',
  ): Observable<IPollingFases[]> {
    let pollingEntity;

    if (entity === 'projetos') pollingEntity = 'dic';
    else if (entity === 'programas') pollingEntity = 'programa';

    return this._http.get<IPollingFases[]>(
      `${this._url}/${entity}/${pollingEntity}/edocs/fases/${idEntity}`,
    );
  }

  public executarPollingFasesEntity(
    idEntity: number,
    entity: 'projetos' | 'programas',
  ): Observable<PollingFasesModel[]> {
    const intervalo = 2000; //ms

    return timer(0, intervalo).pipe(
      switchMap(() =>
        this.consultarFasesEntity(idEntity, entity)
          .pipe(
            tap(lista => {
              // console.log('Resposta do Polling: ', lista);
              // Considerar a ideia de implementar um intervalo maior após certo nº de ciclos
            }),
            map(response => response.map(fase => new PollingFasesModel(fase))),
            catchError(err => {

              console.error('Erro ao obter Fases da entidade!\n', err);
              this._toastService.showToast(
                'error',
                'Ocorreu um erro na integração com o E-Docs',
              );
              return of([]);
            })
          ),
      ),
      takeWhile(
        lista => !lista.every(fase => fase.finalizada) && !lista.some(fase => fase.erro),
        true
      ),
      // take(50),
    )
  }
}
