interface GetSort {
  ascending: boolean;
  descending: boolean;
  direction: string;
  ignoreCase: boolean;
  nullHandling: string;
  property: string;
}

export interface IHttpGetRequestBody {
  page: number;
  size: number;
  sort: string;
  search: string;
}

export interface IHttpGetResponseBody<T> {
  totalElements: number;
  totalPages: number;
  size: number;
  content: Array<T>;
  number: number;
  sort: Array<GetSort>;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  pageable: {
    offset: number;
    sort: Array<GetSort>;
    unpaged: boolean;
    paged: boolean;
    pageSize: number;
    pageNumber: number;
  };
  empty: boolean;
}
