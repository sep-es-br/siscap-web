import { HttpParams } from '@angular/common/http';

import { IHttpGetRequestBody } from '../interfaces/http-get-all-paged.interface';

export abstract class PageableQueryStringParametersHelper {
  public static buildQueryStringParams(
    pageConfig: IHttpGetRequestBody,
    ...searchFilter: { [key: string | number]: any }[]
  ): HttpParams {
    let params = new HttpParams();
    params = params.append('page', pageConfig?.page.toString());
    params = params.append('size', pageConfig?.size.toString());
    params = params.append('sort', pageConfig?.sort);

    if (searchFilter.length > 0) {
      // console.log("result", searchFilter)
      searchFilter.forEach((filter) => {
        Object.keys(filter).forEach((key) => {
          params = params.append(key, filter[key]);
        });
      });
    }

    return params;
  }
}
