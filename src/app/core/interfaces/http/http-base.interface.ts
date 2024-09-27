import { Observable } from 'rxjs';

import {
  IHttpGetRequestBody,
  IHttpGetResponseBody,
} from './http-get.interface';

export interface IHttpBase<T, TTableData, TFormModel> {
  getAllPaged(
    pageConfig: IHttpGetRequestBody
  ): Observable<IHttpGetResponseBody<TTableData>>;

  getById(id: number): Observable<T>;

  post(body: TFormModel): Observable<T>;

  put(id: number, body: TFormModel): Observable<T>;

  delete(id: number): Observable<string>;
}
