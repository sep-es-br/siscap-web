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
  idIndicadorProjeto?: number,
  idIndicador: number,
  nomeIndicador: string,
  unidadeMedida: string,
  polaridade: string,
  medidoPor: string,
  metasIndicador: IMetaIndicador[],
  metasIndicadorProjeto: IMetaIndicador[],
  maiorAnoInidicador: number,
  maiorMetaIndicador: string
}

export interface IMetaIndicador {
  idFato: number,
  anoMeta: number,
  valorMeta: string
}

export interface IFiltroIndicador {
  idGestao: number;
  labels?: IFiltroLabel[];
  desafios?: number[];
}

export interface IFiltroLabel {
  idLabel: number;
  idLabelValores: number[];
}