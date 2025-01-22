import { BotaoPropriedadesModel } from './botao.model';

import { IBotaoPropriedades } from './botao.interface';

export type TBotaoAcao =
  | 'criar'
  | 'cancelar'
  | 'salvar'
  | 'editar'
  | 'enviar'
  | 'prospectar';

export abstract class BotoesConfig {
  private static readonly BOTOESCONFIG_BASE: Record<
    TBotaoAcao,
    IBotaoPropriedades
  > = {
    criar: {
      classeBackground: ['btn-outline-primary'],
      icone: ['fa-solid', 'fa-plus'],
      texto: 'Criar',
      acao: 'criar',
    },
    cancelar: {
      classeBackground: ['btn-outline-danger'],
      icone: ['fa-solid', 'fa-close'],
      texto: 'Cancelar',
      acao: 'cancelar',
    },
    salvar: {
      classeBackground: ['btn-success'],
      icone: ['fa-solid', 'fa-save'],
      texto: 'Salvar',
      acao: 'salvar',
    },
    editar: {
      classeBackground: ['btn-primary'],
      icone: ['fa-solid', 'fa-edit'],
      texto: 'Editar',
      acao: 'editar',
    },
    enviar: {
      classeBackground: ['btn-primary'],
      icone: ['fa-solid', 'fa-upload'],
      texto: 'Enviar',
      acao: 'enviar',
    },
    prospectar: {
      classeBackground: ['btn-outline-success'],
      icone: ['fa-solid', 'fa-paper-plane'],
      texto: 'Prospectar',
      acao: 'prospectar',
    },
  };

  public static gerarBotaoPropriedades(
    tipo: TBotaoAcao,
    override?: Partial<IBotaoPropriedades>
  ): BotaoPropriedadesModel {
    const botaoPropriedades = this.BOTOESCONFIG_BASE[tipo];

    return new BotaoPropriedadesModel(
      override?.classeBackground ?? botaoPropriedades.classeBackground,
      override?.icone ?? botaoPropriedades.icone,
      override?.texto ?? botaoPropriedades.texto,
      override?.acao ?? botaoPropriedades.acao
    );
  }
}
