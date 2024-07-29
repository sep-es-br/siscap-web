import { Injectable } from '@angular/core';
import { Observable, Subject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService {
  private _breadcrumbSubject$: Subject<string> = new Subject<string>();

  constructor() {}

  public emitAction(value: string): void {
    this._breadcrumbSubject$.next(value);
  }

  public handleAction(handlerFn: (actionType: string) => void): Observable<string> {
    return this._breadcrumbSubject$.pipe(
      tap((action: string) => {
        handlerFn(action);
      })
    );
  }
}
