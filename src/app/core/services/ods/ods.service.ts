import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IOdsGestao } from '../../interfaces/ods-gestao.interface';

@Injectable({
  providedIn: 'root'
})
export class OdsService {

  private readonly _url = `${environment.apiUrl}/catalogo-externo`;

  constructor(private readonly _http: HttpClient) { }

  public buscarOds(): Observable<IOdsGestao[]> {
    return this._http.get<IOdsGestao[]>(`${this._url}/ods`);
  }

}