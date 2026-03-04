export enum PapelOrgaoPrograma {
  GESTOR = 1,
  EXECUTOR = 2,
}

export interface OpcaoPapelOrgaoPrograma {
  label: string;
  value: PapelOrgaoPrograma;
}

export const listaOpcoesPapelOrgaoPrograma: Array<OpcaoPapelOrgaoPrograma> = [
  { label: 'Gestor', value: PapelOrgaoPrograma.GESTOR },
  { label: 'Executor', value: PapelOrgaoPrograma.EXECUTOR },
];
