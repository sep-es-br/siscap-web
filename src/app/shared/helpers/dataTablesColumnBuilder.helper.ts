import { projetosColumnTitles } from '../utils/columnTitles.map';

export abstract class DataTablesColumnBuilder {
  /* 
  Retorno do método é do tipo 'any'
  Pode causar problemas
  */
  static columnTitleMapGetter(value: string): any {
    // let selectedMap;
    switch (value) {
      case 'projetos':
        // selectedMap = projetosColumnTitles;
        return projetosColumnTitles;
      // break;
      default:
        break;
    }
    // return selectedMap
  }

  static columnBuilder(
    sourceObject: any,
    mapName: string,
    omitVal?: Array<string>
  ): any[] {
    const sourceObjMap = this.columnTitleMapGetter(mapName);
    let columnsArray = [];
    for (const key in sourceObject) {
      let columnObject: DataTables.ColumnSettings = {};

      if (!omitVal?.includes(key)) {
        columnObject.data = key;
        columnObject.title = sourceObjMap[key];
        columnsArray.push(columnObject);
      }
    }

    return columnsArray;
  }
}
