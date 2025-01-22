import { TBotaoAcao } from './botao.config';

export interface IBotaoPropriedades {
  classeBackground: Array<string>;
  icone: Array<string>;
  texto: string;
  acao: TBotaoAcao;
}
