import {
  ICidadeSelectList,
  ISelectList,
} from '../../interfaces/select-list.interface';

export function construirMicrorregioesCidadesMapObject(
  microrregioesList: Array<ISelectList>,
  cidadesComMicrorregiaoList: Array<ICidadeSelectList>
): Record<number, Array<number>> {
  let microrregioesCidadesMapObject: Record<number, Array<number>> = {};

  microrregioesList.forEach((microrregiao) => {
    const idMicrorregiao = microrregiao.id;

    const idCidadeList = cidadesComMicrorregiaoList
      .filter((cidade) => cidade.idMicrorregiao === microrregiao.id)
      .map((cidade) => cidade.id);

    Object.defineProperty(microrregioesCidadesMapObject, idMicrorregiao, {
      value: idCidadeList,
    });
  });

  return microrregioesCidadesMapObject;
}
