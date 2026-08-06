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

    const usarMock = false;

    if (usarMock) {
      return of({
        id: 1,
        descricao: '2024-2027'
      } as IPeriodoPlanejamento);
    }

    return this._http.get<IPeriodoPlanejamento>(
      `${this._url}/ppa`
    );

  }

  listarAnosPpaLoa(): Observable<IOpcaoPlanejamento[]> {

    const usarMock = false;

    if (usarMock) {

      const anosMock = [
        {
          id: 2024,
          nome: '2024'
        },
        {
          id: 2025,
          nome: '2025'
        },
        {
          id: 2026,
          nome: '2026'
        },
        {
          id: 2027,
          nome: '2027'
        }
      ] as IOpcaoPlanejamento[];

      return of(anosMock.map(ano => ({
        id: ano.id,
        nome: ano.nome
      })));

    }

    return this._http.get<IOpcaoPlanejamento[]>(
      `${this._url}/ppa/anos`
    );

  }

  listarUosPorAnosPpaLoa(idAnos: number[]): Observable<IOpcaoPlanejamento[]> {

    const usarMock = false;

    if (usarMock) {

      const uosMock = [
        {
          id: 1101,
          nome: 'ALEES'
        },
        {
          id: 2101,
          nome: 'TCEES'
        },
        {
          id: 3101,
          nome: 'TJEES'
        },
        {
          id: 3901,
          nome: 'FUNEPJ'
        },
        {
          id: 5101,
          nome: 'MPES'
        },
        {
          id: 5901,
          nome: 'FERIDL'
        },
        {
          id: 5902,
          nome: 'FUNEMP'
        },
        {
          id: 6101,
          nome: 'DPES'
        },
        {
          id: 6901,
          nome: 'FADEPES'
        },
        {
          id: 10101,
          nome: 'SCV'
        },
      ] as IOpcaoPlanejamento[];

      return of(uosMock.map(uo => ({
        id: uo.id,
        nome: uo.nome
      })));

    }

    return this._http.get<IOpcaoPlanejamento[]>(
      `${this._url}/ppa/uos/${idAnos[0]}`
    );

  }

  listarFuncoesPpaLoa(idsAnos: number[], idsUos: number[]): Observable<IOpcaoPlanejamento[]> {

    const usarMock = false;

    if (usarMock) {

      const funcoesMock = [
        {
          id: 1,
          nome: 'LEGISLATIVA'
        },
        {
          id: 2,
          nome: 'JUDICIÁRIA'
        },
        {
          id: 3,
          nome: 'ESSENCIAL À JUSTIÇA'
        },
        {
          id: 4,
          nome: 'ADMINISTRAÇÃO'
        },
        {
          id: 5,
          nome: 'DEFESA NACIONAL'
        },
        {
          id: 6,
          nome: 'SEGURANÇA PÚBLICA'
        },
        {
          id: 7,
          nome: 'RELAÇÕES EXTERIORES'
        },
        {
          id: 8,
          nome: 'ASSISTÊNCIA SOCIAL'
        },
        {
          id: 9,
          nome: 'PREVIDÊNCIA SOCIAL'
        },
        {
          id: 10,
          nome: 'SAÚDE'
        }
      ] as IOpcaoPlanejamento[];

      return of(funcoesMock.map(funcao => ({
        id: funcao.id,
        nome: funcao.id.toString().padStart(2, '0') + '-' + funcao.nome
      })));

    }

    const params = new HttpParams()
      .set('anos', idsAnos.join(','))
      .set('uos', idsUos.join(','));

    return this._http.get<IOpcaoPlanejamento[]>(
      `${this._url}/ppa/funcoes`,
      { params }
    ).pipe(
      map(funcoes =>
        funcoes.map(funcao => ({
          ...funcao,
          nome: funcao.id.toString().padStart(2, '0') + '-' + funcao.nome
        }))
      )
    );

  }

  listarProgramasPorFuncoes(idsAnos: number[], idsFuncoes: number[], idsUos: number[]): Observable<IOpcaoPlanejamento[]> {

    const usarMock = false;

    if (usarMock) {

      const programasMock = [
        {
          id: 27,
          nome: 'GESTÃO ESTRATÉGICA DE PESSOAS',
          idAno: 2024,
          idUo: 1101,
          idFuncao: 1
        },
        {
          id: 61,
          nome: 'SAÚDE CIDADÃ',
          idAno: 2024,
          idUo: 1101,
          idFuncao: 1
        }
      ];

      const programasFiltrados: IOpcaoPlanejamento[] = programasMock
        .filter(programa =>
          idsAnos.includes(programa.idAno) &&
          idsFuncoes.includes(programa.idFuncao) &&
          idsUos.includes(programa.idUo)
        )
        .map(programa => ({
          id: programa.id,
          nome: programa.id.toString().padStart(4, '0') + '-' + programa.nome
        }));

      return of(programasFiltrados);

    }

    const params = new HttpParams()
      .set('anos', idsAnos.join(','))
      .set('uos', idsUos.join(','))
      .set('funcoes', idsFuncoes.join(','));

    return this._http.get<IOpcaoPlanejamento[]>(
      `${this._url}/ppa/programas`,
      { params }
    );

  }

  listarAcoesPorProgramas(idFuncoes: number[], idsProgramas: number[], idAnos: number[], idUos: number[]): Observable<IOpcaoPlanejamento[]> {

    const params = new HttpParams()
      .set('funcoes', idFuncoes.join(','))
      .set('programas', idsProgramas.join(','))
      .set('anos', idAnos.join(','))
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