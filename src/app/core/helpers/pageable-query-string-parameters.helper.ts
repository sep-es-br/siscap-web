import { HttpParams } from '@angular/common/http';
import { IHttpGetRequestBody } from '../interfaces/http/http-get.interface';

export abstract class PageableQueryStringParametersHelper {
  public static buildQueryStringParams(
    pageConfig: IHttpGetRequestBody,
    ...searchFilter: { [key: string]: any }[]
  ): HttpParams {
    let params = new HttpParams();
    params = params.append('page', pageConfig.page.toString());
    params = params.append('size', pageConfig.size.toString());
    params = params.append('sort', pageConfig.sort);

    if (searchFilter.length > 0) {
      searchFilter.forEach((filter) => {
        Object.keys(filter).forEach((key) => {
          params = params.append(key, filter[key]);
        });
      });
    }

    return params;
  }
}
