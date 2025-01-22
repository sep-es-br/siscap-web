import { Observable } from 'rxjs';

export interface GetById<T> {
  getById(id: number): Observable<T>;
}
