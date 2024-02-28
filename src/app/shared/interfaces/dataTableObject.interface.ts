export interface DataTableObject<T> {
    dataArray: Array<T>;
    columnTitles: string;
    omittedFields?: Array<string>
}