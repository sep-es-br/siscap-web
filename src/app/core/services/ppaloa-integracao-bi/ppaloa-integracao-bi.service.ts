import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { IOpcaoPlanejamento, IPeriodoPlanejamento } from '../../../pages/projetos/projeto-ppa-loa/ppa-loa-filtro/filtro-acoes.component';
import { Observable, of } from 'rxjs';

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
        `${this._url}/ppa/anos/`
      );
  
    }

}