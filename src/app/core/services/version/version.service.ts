import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, timeout } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class VersionService {
  private readonly http: HttpClient;

  constructor(backend: HttpBackend) {
    // Metadados públicos: falhas não devem disparar os alertas/redirects globais.
    this.http = new HttpClient(backend);
  }

  consultarWebApp(): Observable<string> {
    return this.consultar(`assets/version.json?t=${Date.now()}`);
  }

  consultarApi(): Observable<string> {
    return this.consultar(`${environment.apiUrl.replace(/\/$/, '')}/version`);
  }

  private consultar(url: string): Observable<string> {
    return this.http.get<{ version?: unknown }>(url).pipe(
      timeout(5000),
      map(response => typeof response?.version === 'string' && response.version.trim()
        ? response.version.trim()
        : 'Não disponível'),
      catchError(() => of('Não disponível')),
    );
  }
}
