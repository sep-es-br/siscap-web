import { BotaoPropriedadesModel } from './botao.model';

import { IBotaoPropriedades } from './botao.interface';

export type TBotaoAcao =
  | 'confirmar'
  | 'criar'
  | 'cancelar'
  | 'voltar'
  | 'salvar'
  | 'editar'
  | 'deletar'
  | 'enviar'
  | 'prospectar';

export abstract class BotoesConfig {
  private static readonly BOTOESCONFIG_BASE: Record<
    TBotaoAcao,
    IBotaoPropriedades
  > = {
    confirmar: {
      classesCSS: ['btn-success'],
      icone: ['fa-solid', 'fa-thumbs-up'],
      texto: 'Confirmar',
      acao: 'confirmar',
    },
    criar: {
      classesCSS: ['btn-outline-primary'],
      icone: ['fa-solid', 'fa-plus'],
      texto: 'Criar',
      acao: 'criar',
    },
    cancelar: {
      classesCSS: ['btn-outline-danger'],
      icone: ['fa-solid', 'fa-close'],
      texto: 'Cancelar',
      acao: 'cancelar',
    },
    voltar: {
      classesCSS: ['btn-outline-primary'],
      icone: ['fa-solid', 'fa-arrow-turn-up', 'fa-rotate-270'],
      texto: 'Voltar',
      acao: 'voltar',
    },
    salvar: {
      classesCSS: ['btn-success'],
      icone: ['fa-solid', 'fa-save'],
      texto: 'Salvar',
      acao: 'salvar',
    },
    editar: {
      classesCSS: ['btn-primary'],
      icone: ['fa-solid', 'fa-edit'],
      texto: 'Editar',
      acao: 'editar',
    },
    deletar: {
      classesCSS: ['btn-danger'],
      icone: ['fa-solid', 'fa-trash'],
      texto: 'Deletar',
      acao: 'deletar',
    },
    enviar: {
      classesCSS: ['btn-primary'],
      icone: ['fa-solid', 'fa-upload'],
      texto: 'Enviar',
      acao: 'enviar',
    },
    prospectar: {
      classesCSS: ['btn-outline-success'],
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
      override?.classesCSS ?? botaoPropriedades.classesCSS,
      override?.icone ?? botaoPropriedades.icone,
      override?.texto ?? botaoPropriedades.texto,
      override?.acao ?? botaoPropriedades.acao,
      override?.desabilitado ?? botaoPropriedades.desabilitado
    );
  }
}
