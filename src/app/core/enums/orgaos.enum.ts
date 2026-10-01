import { MENSAGENS } from '../utils/constants';
export enum PapelOrgaoPrograma {
  GESTOR = 1,
  EXECUTOR = 2,
}

export interface OpcaoPapelOrgaoPrograma {
  label: string;
  value: PapelOrgaoPrograma;
}

export const listaOpcoesPapelOrgaoPrograma: Array<OpcaoPapelOrgaoPrograma> = [
  { label: MENSAGENS.GESTOR, value: PapelOrgaoPrograma.GESTOR },
  { label: MENSAGENS.EXECUTOR, value: PapelOrgaoPrograma.EXECUTOR },
];
