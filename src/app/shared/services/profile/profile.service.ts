import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable, catchError, throwError } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { IProfile } from '../../interfaces/profile.interface';
import { ErrorHandlerService } from '../error-handler/error-handler.service';

enum PermissionsMap {
  projetoscriar = 'PROJETO_CADASTRAR',
  projetoseditar = 'PROJETO_ATUALIZAR',

  pessoascriar = 'PESSOA_CADASTRAR',
  pessoaseditar = 'PESSOA_ATUALIZAR',

  organizacoescriar = 'ORGANIZACAO_CADASTRAR',
  organizacoeseditar = 'ORGANIZACAO_ATUALIZAR',
}

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private _url = `${environment.apiUrl}/signin/user-info`;

  constructor(
    private _http: HttpClient,
    private _errorHandlerService: ErrorHandlerService
  ) {}

  public getUserInfo(): Observable<IProfile> {
    return this._http.get<IProfile>(`${this._url}`).pipe(
      catchError((err: HttpErrorResponse) => {
        this._errorHandlerService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  public isAllowed(value: string): boolean {
    const userPermissions: Array<string> =
      JSON.parse(sessionStorage.getItem('user-profile')!).permissoes ?? [];

    if (userPermissions.includes('ADMIN_AUTH')) {
      return true;
    }

    return userPermissions.includes(
      PermissionsMap[value as keyof typeof PermissionsMap]
    );
  }
}
