import { TBotaoAcao } from './botao.config';

import { IBotaoPropriedades } from './botao.interface';

export class BotaoPropriedadesModel implements IBotaoPropriedades {
  public classeBackground: Array<string>;
  public icone: Array<string>;
  public texto: string;
  public acao: TBotaoAcao;

  constructor(
    classeBackground: Array<string>,
    icone: Array<string>,
    texto: string,
    acao: TBotaoAcao
  ) {
    this.classeBackground = classeBackground;
    this.icone = icone;
    this.texto = texto;
    this.acao = acao;
  }
}
