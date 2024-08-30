interface GetSort {
  empty: boolean;
  unsorted: boolean;
  sorted: boolean;
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
  sort: GetSort;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  pageable: {
    offset: number;
    sort: GetSort;
    unpaged: boolean;
    paged: boolean;
    pageSize: number;
    pageNumber: number;
  };
  empty: boolean;
}
