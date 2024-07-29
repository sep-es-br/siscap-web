import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpResponse,
} from '@angular/common/http';

import { Observable, catchError, throwError } from 'rxjs';

import { environment } from '../../../../environments/environment';

import { ErrorHandlerService } from '../error-handler/error-handler.service';
import {
  IHttpGetRequestBody,
  IHttpGetResponseBody,
} from '../../interfaces/http-get.interface';
import {
  IProjeto,
  IProjetoForm,
  IProjetoTableData,
} from '../../interfaces/projeto.interface';

@Injectable({
  providedIn: 'root',
})
export class ProjetosService {
  private _url = `${environment.apiUrl}/projetos`;

  constructor(
    private _http: HttpClient,
    private _errorHandlerService: ErrorHandlerService
  ) {}

  public getProjetoById(id: number): Observable<IProjeto> {
    return this._http.get<IProjeto>(`${this._url}/${id}`).pipe(
      catchError((err: HttpErrorResponse) => {
        this._errorHandlerService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  public getProjetosPaginated(
    pageConfig: IHttpGetRequestBody
  ): Observable<IHttpGetResponseBody<IProjetoTableData>> {
    const params = {
      size: pageConfig.size?.toString() ?? '15',
      page: pageConfig.page !== undefined ? pageConfig.page.toString() : '0',
      sort: pageConfig.sort !== undefined ? pageConfig.sort?.toString() : '',
      search:
        pageConfig.search !== undefined ? pageConfig.search.toString() : '',
    };

    return this._http
      .get<IHttpGetResponseBody<IProjetoTableData>>(
        `${this._url}?${new URLSearchParams(params).toString()}`
      )
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this._errorHandlerService.handleError(err);
          return throwError(() => err);
        })
      );
  }

  public putProjeto(id: number, body: IProjetoForm): Observable<IProjeto> {
    return this._http.put<IProjeto>(`${this._url}/${id}`, body).pipe(
      catchError((err: HttpErrorResponse) => {
        this._errorHandlerService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  public deleteProjeto(id: number): Observable<string> {
    return this._http
      .delete(`${this._url}/${id}`, { responseType: 'text' })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this._errorHandlerService.handleError(err);
          return throwError(() => err);
        })
      );
  }

  public postProjeto(body: IProjetoForm): Observable<IProjeto> {
    return this._http.post<IProjeto>(this._url, body).pipe(
      catchError((err: HttpErrorResponse) => {
        this._errorHandlerService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  public downloadDIC(id: number) {
    const userHttpOptions: Object = {
      responseType: 'arraybuffer',
      observe: 'response',
    };
    this._http
      .get<Blob>(`${this._url}/dic/${id}`, userHttpOptions)
      .subscribe((response) => {
        if (response instanceof HttpResponse) {
          const httpResponse = response as HttpResponse<Blob>;
          const contentDisposition = httpResponse.headers.get(
            'Content-Disposition'
          );
          if (httpResponse.body && contentDisposition) {
            const filename = contentDisposition
              .split('filename=')[1]
              .split(';')[0]
              .replace(/["']/g, '');
            const pdfBlob = new Blob([httpResponse.body], {
              type: 'application/pdf',
            });
            let url = window.URL.createObjectURL(pdfBlob);
            let a = document.createElement('a');
            document.body.appendChild(a);
            a.setAttribute('style', 'display: none');
            a.href = url;
            a.download = filename;
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
          }
        }
      });
  }
}
