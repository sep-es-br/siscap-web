import { IOpcoesDropdown } from './opcoes-dropdown.interface';

export interface IProgramaDic {
  id: number;
  nome: string;
  objetivo: string | null;
}

export interface IProgramaInformacoesDics {
  dics: IProgramaDic[];
  regioesAtendidas: IOpcoesDropdown[];
}
