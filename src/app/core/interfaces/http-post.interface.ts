import { Observable } from 'rxjs';

export interface Post<T, TFormModel> {
  post(body: TFormModel): Observable<T>;
}
