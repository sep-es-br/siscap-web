import { MetaDefinition } from "@angular/platform-browser";


export interface IGestoesCatalogoExterno {
  idGestao: number;
  nomeGestao: string;
  labels: Label[];
  desafios: Desafio[];
}

export interface Label {
  idLabel: number;
  nome: string;
  ordem: number;
  valores: LabelValor[];
}

export interface LabelValor {
  idLabelValor: number;
  valor: string;
}

export interface Desafio {
  id: number;
  nome: string;
}

export interface IIndicadoresCatalogoExterno {
  idIndicador: number,
  nomeIndicador: string,
  unidadeMedida: string,
  polaridade: string,
  medidoPor: string,
  metasIndicador: IMetaIndicador[],
  metasIndicadorProjeto: IMetaIndicador[]
}

export interface IMetaIndicador {
  idMeta: number,
  valorMeta: string,
  anoMeta: string
}