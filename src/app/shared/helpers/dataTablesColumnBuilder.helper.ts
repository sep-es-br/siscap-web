import {
  ColumnTitleObject,
  projetosColumnTitles,
} from '../utils/columnTitles.map';

export abstract class DataTablesColumnBuilder {
  static columnTitleMapGetter(value: string): ColumnTitleObject {
    let selectedMap!: ColumnTitleObject;
    switch (value) {
      case 'projetos':
        selectedMap = projetosColumnTitles;
        break;

      default:
        break;
    }
    return selectedMap;
  }

  static columnBuilder(sourceObject: any, mapName: string): any[] {
    const sourceObjMap = this.columnTitleMapGetter(mapName) ?? {};
    let columnsArray = [];

    for (const key in sourceObject) {
      let columnObject: DataTables.ColumnSettings = {};

      if (key != 'id') {
        columnObject.data = key;
        columnObject.title = sourceObjMap[key] ?? key;
        columnsArray.push(columnObject);
      }
    }

    return columnsArray;
  }
}
