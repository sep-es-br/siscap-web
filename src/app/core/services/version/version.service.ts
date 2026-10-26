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
    const version = environment.version.trim();
    return of(version && !version.includes('@release#@') ? version : 'Desenvolvimento');
  }

  consultarApi(): Observable<string> {
    return this.consultar(`${environment.apiUrl.replace(/\/$/, '')}/versions`);
  }

  private consultar(url: string): Observable<string> {
    return this.http.get<{ version?: unknown; success?: boolean; data?: { version?: unknown } }>(url).pipe(
      timeout(5000),
      map(response => {
        if (response?.success === false) return 'Não disponível';
        const version = response?.data?.version ?? response?.version;
        return typeof version === 'string' && version.trim() ? version.trim() : 'Não disponível';
      }),
      catchError(() => of('Não disponível')),
    );
  }
}
