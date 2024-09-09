import { HttpParams } from '@angular/common/http';
import { IHttpGetRequestBody } from '../interfaces/http/http-get.interface';

export abstract class PageableQueryStringParametersHelper {
  public static buildQueryStringParams(
    pageConfig: IHttpGetRequestBody
  ): HttpParams {
    let params = new HttpParams();
    params = params.append('page', pageConfig.page.toString());
    params = params.append('size', pageConfig.size.toString());
    params = params.append('sort', pageConfig.sort);
    params = params.append('search', pageConfig.search);
    return params;
  }
}
