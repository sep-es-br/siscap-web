import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { IOpcaoPlanejamento, IPeriodoPlanejamento } from '../../../pages/projetos/projeto-ppa-loa/ppa-loa-filtro/filtro-acoes.component';
import { map, Observable, of, tap } from 'rxjs';
import { PlanejamentoAcao } from '../../../pages/projetos/projeto-ppa-loa/projeto-ppa-loa.component';

@Injectable({
  providedIn: 'root'
})
export class PpaloaIntegracaoBiService {

  constructor(private readonly _http: HttpClient) { }

  private readonly _url = `${environment.apiUrl}/ppaloa/bi`;

  buscarPeriodoPpaVigente(): Observable<IPeriodoPlanejamento> {

    return this._http.get<IPeriodoPlanejamento>(
      `${this._url}/ppa`
    );

  }

  listarAnosPpaLoa(): Observable<IOpcaoPlanejamento[]> {

    return this._http.get<IOpcaoPlanejamento[]>(
      `${this._url}/ppa/anos`
    );

  }

  listarUosPorPpaLoa(ppa: string): Observable<IOpcaoPlanejamento[]> {

    return this._http.get<IOpcaoPlanejamento[]>(
      `${this._url}/ppa/uos/${ppa}`
    );

  }

  listarFuncoesPpaLoa(ppa: string, idsUos: number[]): Observable<IOpcaoPlanejamento[]> {

    const params = new HttpParams()
      .set('ppa', ppa)
      .set('uos', idsUos.join(','));

    return this._http.get<IOpcaoPlanejamento[]>(
      `${this._url}/ppa/funcoes`,
      { params }
    ).pipe(
      map(funcoes =>
        funcoes.map(funcao => ({
          ...funcao,
          nome: funcao.nome
        }))
      )
    );

  }

  listarProgramasPorFuncoes(ppa: string, idsFuncoes: number[], idsUos: number[]): Observable<IOpcaoPlanejamento[]> {

    const params = new HttpParams()
      .set('ppa', ppa)
      .set('uos', idsUos.join(','))
      .set('funcoes', idsFuncoes.join(','));

    return this._http.get<IOpcaoPlanejamento[]>(
      `${this._url}/ppa/programas`,
      { params }
    );

  }

  listarAcoesPorProgramas(idFuncoes: number[], idsProgramas: number[], ppa: string, idUos: number[]): Observable<IOpcaoPlanejamento[]> {

    const params = new HttpParams()
      .set('funcoes', idFuncoes.join(','))
      .set('programas', idsProgramas.join(','))
      .set('ppa', ppa)
      .set('uos', idUos.join(','));

    return this._http.get<IOpcaoPlanejamento[]>(
      `${this._url}/ppa/acoes`,
      { params }
    );

  }

  buscarDadosAcoes(ppa: string, idFuncoes: number[], idsProgramas: number[], idAnos: number[], idUos: number[], idsAcoes: number[]): Observable<PlanejamentoAcao[]> {

    const params = new HttpParams()
      .set('ppa', ppa)
      .set('funcoes', idFuncoes.join(','))
      .set('programas', idsProgramas.join(','))
      .set('anos', idAnos.join(','))
      .set('uos', idUos.join(','))
      .set('acoes', idsAcoes.join(','));

    return this._http.get<PlanejamentoAcao[]>(
      `${this._url}/ppa/acoes/dados`,
      { params }
    ).pipe(
      tap(response => {
        // console.log('Response recebido no serviço:', response);
      })
    );


  }

}