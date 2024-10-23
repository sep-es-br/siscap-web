// import {
//   ICidadeSelectList,
//   ISelectList,
// } from '../interfaces/select-list.interface';

import { ILocalidadeSelectList } from '../interfaces/select-list.interface';

// export function construirMicrorregioesCidadesMapObject(
//   microrregioesSelectList: Array<ISelectList>,
//   cidadesComMicrorregiaoSelectList: Array<ICidadeSelectList>
// ): Record<number, Array<number>> {
//   let microrregioesCidadesMapObject: Record<number, Array<number>> = {};

//   microrregioesSelectList.forEach((microrregiao) => {
//     const idMicrorregiao = microrregiao.id;

//     const idCidadeList = cidadesComMicrorregiaoSelectList
//       .filter((cidade) => cidade.idMicrorregiao === microrregiao.id)
//       .map((cidade) => cidade.id);

//     Object.defineProperty(microrregioesCidadesMapObject, idMicrorregiao, {
//       value: idCidadeList,
//     });
//   });

//   return microrregioesCidadesMapObject;
// }

export function construirMicrorregioesCidadesMapObject(
  localidadesSelectList: Array<ILocalidadeSelectList>
): Record<number, boolean> {
  let microrregioesCidadesMapObject: Record<number, boolean> = {};

  localidadesSelectList.forEach((localidade) => {
    Object.defineProperty(microrregioesCidadesMapObject, localidade.id, {
      value: false,
    });
  });

  return microrregioesCidadesMapObject;
}
