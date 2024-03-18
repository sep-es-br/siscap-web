import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { IProfile } from '../../interfaces/profile.interface';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private _url = `${environment.apiUrl}/signin/user-info`;

  constructor(private _http: HttpClient) { }

  getUserInfo(): Observable<IProfile> {
    return this._http.get<IProfile>(`${this._url}`);
  }

}
