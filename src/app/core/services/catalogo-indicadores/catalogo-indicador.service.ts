import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { IGestoesCatalogoExterno, IIndicadoresCatalogoExterno } from '../../interfaces/indicadores-catalogo-externo.interface';

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
    return this.http.get<IGestoesCatalogoExterno[]>(`${this._url}/gestoes`);
  }

  /**
   * Lista indicadores por gestão
   * GET /catalogo-externo/gestao/{idGestao}/indicadores
   */
  getIndicadoresPorGestaoCatalogoExternos(idGestao: number): Observable<IIndicadoresCatalogoExterno[]> {
    return this.http.get<IIndicadoresCatalogoExterno[]>(
      `${this._url}/gestoes/${idGestao}/indicadores`
    );
  }

}
