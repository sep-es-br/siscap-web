import { Observable } from 'rxjs';

export interface Put<T, TFormModel> {
  put(id: number, body: TFormModel): Observable<T>;
}
