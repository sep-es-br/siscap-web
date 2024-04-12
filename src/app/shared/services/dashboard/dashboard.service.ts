import { Injectable } from '@angular/core';
import {
  HttpBackend,
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';

import {
  Observable,
  catchError,
  lastValueFrom,
  map,
  switchMap,
  throwError,
} from 'rxjs';
import { EmbedDashboardParams, UiConfigType } from '@superset-ui/embedded-sdk';

import { ErrorHandlerService } from '../error-handler/error-handler.service';

import {
  ISupersetGuestTokenRequestBody,
  ISupersetGuestTokenResponseBody,
  ISupersetLoginRequestBody,
  ISupersetLoginResponseBody,
} from '../../interfaces/dashboard.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private _url = `${environment.supersetUrl}/api/v1/security`;

  private readonly _supersetEmbedId = {
    desktop: '101ec9f0-b2ce-470c-9ebb-1a26fb1b3686', // Dashboard - SISCAP HOM
    mobile: '2f450f7f-6d18-42bb-99e4-926eae9ba551', // SEP BI - PROJETOS ESTRATÉGICOS
  };

  constructor(
    private _http: HttpClient,
    private _handler: HttpBackend,
    private _errorHandlerService: ErrorHandlerService
  ) {}

  private supersetLogIn(): Observable<ISupersetLoginResponseBody> {
    const reqBody: ISupersetLoginRequestBody = {
      username: 'embed',
      password: 'Sup3Rs&t3mBeD@SEP',
      provider: 'db',
      refresh: false,
    };

    return this._http
      .post<ISupersetLoginResponseBody>(`${this._url}/login`, reqBody)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this._errorHandlerService.handleError(err);
          return throwError(() => err);
        })
      );
  }

  private supersetGuestToken(
    accessToken: string,
    isMobile: boolean
  ): Observable<ISupersetGuestTokenResponseBody> {
    const reqBody: ISupersetGuestTokenRequestBody = {
      resources: [
        {
          id: isMobile
            ? this._supersetEmbedId.mobile
            : this._supersetEmbedId.desktop,
          type: 'dashboard',
        },
      ],
      rls: [],
      user: {
        first_name: 'guest',
        last_name: 'guest',
        username: 'guest',
      },
    };

    const reqHeaders = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    // Nova instância de HttpClient passando um handler do tipo HttpBackend
    // Utilizado para acoplar nova bearer-token no header da requisição (Override do interceptor padrão)
    const bypassInterceptorHttp = new HttpClient(this._handler);

    return bypassInterceptorHttp
      .post<ISupersetGuestTokenResponseBody>(
        `${this._url}/guest_token/`,
        reqBody,
        { headers: reqHeaders }
      )
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this._errorHandlerService.handleError(err);
          return throwError(() => err);
        })
      );
  }

  private fetchSupersetGuestToken(isMobile: boolean): Promise<string> {
    return lastValueFrom(
      this.supersetLogIn().pipe(
        switchMap((logInResponse: ISupersetLoginResponseBody) =>
          this.supersetGuestToken(logInResponse.access_token, isMobile)
        ),
        map<ISupersetGuestTokenResponseBody, string>(
          (guestTokenResponse: ISupersetGuestTokenResponseBody) =>
            guestTokenResponse.token
        )
      )
    );
  }

  public getEmbedDashboardParams(
    dashboardEl: HTMLElement,
    isMobile: boolean,
    uiConfig?: UiConfigType
  ): EmbedDashboardParams {
    const dashboardParams = {
      id: isMobile
        ? this._supersetEmbedId.mobile
        : this._supersetEmbedId.desktop,
      supersetDomain: environment.supersetUrl,
      mountPoint: dashboardEl,
      fetchGuestToken: () => this.fetchSupersetGuestToken(isMobile),
      dashboardUiConfig: uiConfig ?? {},
    };

    return dashboardParams;
  }
}
