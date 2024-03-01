export interface DataTableObject<T> {
  dataArray: Array<T>;
  columnTitles: string;
  pipes?: Array<{ dataTarget: string; pipeName: string }>;
}
