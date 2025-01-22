import { Observable } from 'rxjs';

export interface DeleteById {
  deleteById(id: number): Observable<string>;
}
