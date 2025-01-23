import { TBotaoAcao } from './botao.config';

export interface IBotaoPropriedades {
  classesCSS: Array<string>;
  icone: Array<string>;
  texto: string;
  acao: TBotaoAcao;
  desabilitado?: boolean;
}
