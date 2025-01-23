import { TBotaoAcao } from './botao.config';

import { IBotaoPropriedades } from './botao.interface';

export class BotaoPropriedadesModel implements IBotaoPropriedades {
  public classesCSS: Array<string>;
  public icone: Array<string>;
  public texto: string;
  public acao: TBotaoAcao;
  public desabilitado?: boolean;

  constructor(
    classesCSS: Array<string>,
    icone: Array<string>,
    texto: string,
    acao: TBotaoAcao,
    desabilitado?: boolean
  ) {
    this.classesCSS = classesCSS;
    this.icone = icone;
    this.texto = texto;
    this.acao = acao;
    this.desabilitado = desabilitado;
  }
}
