import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';

import { Observable, catchError, throwError } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  IProject,
  IProjectCreate,
  IProjectEdit,
  IProjectGet,
} from '../../interfaces/project.interface';
import { ErrorHandlerService } from '../error-handler/error-handler.service';

@Injectable({
  providedIn: 'root',
})
export class ProjetosService {
  private _url = `${environment.apiUrl}/projetos`;

  constructor(
    private _http: HttpClient,
    private _errorHandlerService: ErrorHandlerService
  ) {}

  getProjetoById(id: number): Observable<IProject> {
    return this._http.get<IProject>(`${this._url}/${id}`).pipe(
      catchError((err: HttpErrorResponse) => {
        this._errorHandlerService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  putProjeto(id: number, body: IProjectEdit): Observable<IProject> {
    return this._http.put<IProject>(`${this._url}/${id}`, body).pipe(
      catchError((err: HttpErrorResponse) => {
        this._errorHandlerService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  deleteProjeto(id: number): Observable<string> {
    return this._http
      .delete(`${this._url}/${id}`, { responseType: 'text' })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this._errorHandlerService.handleError(err);
          return throwError(() => err);
        })
      );
  }

  // TODO: Ver como anexar body no get (IHttpGetRequestBody)
  getProjetos(): Observable<IProjectGet> {
    return this._http.get<IProjectGet>(this._url).pipe(
      catchError((err: HttpErrorResponse) => {
        this._errorHandlerService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  postProjeto(body: IProjectCreate): Observable<IProject> {
    return this._http.post<IProject>(this._url, body).pipe(
      catchError((err: HttpErrorResponse) => {
        this._errorHandlerService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  downloadDIC(id: number) {
    const userHttpOptions: Object = {
      responseType: 'arraybuffer',
      observe: 'response'
    };
    this._http.get<Blob>(`${this._url}/dic/${id}`, userHttpOptions).subscribe((response) => {

      if (response instanceof HttpResponse) {
        const httpResponse = response as HttpResponse<Blob>;
        const contentDisposition = httpResponse.headers.get('Content-Disposition');
        if (httpResponse.body && contentDisposition) {
          const filename = contentDisposition.split('filename=')[1].split(';')[0].replace(/["']/g, "");
          const pdfBlob = new Blob([httpResponse.body], { type: "application/pdf", });
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
