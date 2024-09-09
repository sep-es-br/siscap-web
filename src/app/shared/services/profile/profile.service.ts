import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, Observable } from 'rxjs';

import { IProfile, PermissionsMap } from '../../interfaces/profile.interface';

import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private _url = `${environment.apiUrl}/signin/user-info`;
  private _sessionProfileSubject = new BehaviorSubject<IProfile>({
    token: '',
    nome: '',
    email: '',
    subNovo: '',
    permissoes: [],
  });
  public sessionProfile$ = this._sessionProfileSubject.asObservable();

  constructor(private _http: HttpClient) {}

  public getUserInfo(): Observable<IProfile> {
    return this._http.get<IProfile>(`${this._url}`);
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

  atualizarPerfil(perfil: IProfile) {
    sessionStorage.setItem('user-profile', JSON.stringify(perfil));
    this._sessionProfileSubject.next(perfil);
  }
}
