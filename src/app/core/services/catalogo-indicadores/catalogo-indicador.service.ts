import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { IFiltroIndicador, IGestoesCatalogoExterno, IIndicadoresCatalogoExterno } from '../../interfaces/indicadores-catalogo-externo.interface';

@Injectable({
  providedIn: 'root'
})
export class CatalogoIndicadorService {

  constructor(private http: HttpClient) { }

  private readonly _url = `${environment.apiUrl}/catalogo-externo`;

  /**
   * Lista todas as gestões ativas
   * GET /catalogo-externo/gestao
   */
  getGestoesIndicadoresCatalogoExternos(): Observable<IGestoesCatalogoExterno[]> {
    //console.log('GET', `${this._url}/gestoes`);
    return this.http.get<IGestoesCatalogoExterno[]>(`${this._url}/gestoes`);
  }

  /**
   * Lista indicadores por gestão
   * GET /catalogo-externo/gestao/{idGestao}/indicadores
   */
  getIndicadoresPorGestaoCatalogoExternos(idGestao: number, filtro?: IFiltroIndicador): Observable<IIndicadoresCatalogoExterno[]> {
    
    let params = new HttpParams();

    if (filtro?.labels?.length) {
      filtro.labels.forEach((id: number) => {
        params = params.append('label', id);
      });
    }

    if (filtro?.labelValores?.length) {
      filtro.labelValores.forEach((id: number) => {
        params = params.append('lableValor', id);
      });
    }

    if (filtro?.desafios?.length) {
      filtro.desafios.forEach((id: number) => {
        params = params.append('desafio', id);
      });
    }

    console.log('PARAMETROS :', { params });

    return this.http.get<IIndicadoresCatalogoExterno[]>(
      `${this._url}/gestoes/${idGestao}/indicadores`,
      { params }
    );

  }

  // getIndicadoresPorFiltroCatalogoExternos(filtro: any): Observable<IIndicadoresCatalogoExterno[]> {
  //   return this.http.get<IIndicadoresCatalogoExterno[]>(
  //     `${this._url}/gestoes/indicadores?filtro=${filtro}`
  //   );
  // }

}