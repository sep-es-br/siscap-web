export type TTableActions = 'editar' | 'deletar' | 'visualizar';

export interface ITableActionOutput {
  id: number;
  acao: TTableActions;
}
