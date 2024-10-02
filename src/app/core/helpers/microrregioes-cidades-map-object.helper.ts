import {
  ICidadeSelectList,
  ISelectList,
} from '../interfaces/select-list.interface';

export function construirMicrorregioesCidadesMapObject(
  microrregioesSelectList: Array<ISelectList>,
  cidadesComMicrorregiaoSelectList: Array<ICidadeSelectList>
): Record<number, Array<number>> {
  let microrregioesCidadesMapObject: Record<number, Array<number>> = {};

  microrregioesSelectList.forEach((microrregiao) => {
    const idMicrorregiao = microrregiao.id;

    const idCidadeList = cidadesComMicrorregiaoSelectList
      .filter((cidade) => cidade.idMicrorregiao === microrregiao.id)
      .map((cidade) => cidade.id);

    Object.defineProperty(microrregioesCidadesMapObject, idMicrorregiao, {
      value: idCidadeList,
    });
  });

  return microrregioesCidadesMapObject;
}
