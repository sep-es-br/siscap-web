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
  | 'prospectar'
  | 'autuarEdocs'
  | 'revisar'
  | 'recusar'
  | 'arquivar'
  | 'complementar'
  | 'parecerestrategicoorcamentario'
  | 'salvarparecer'
  | 'efetivarparecerestrategicoorcamentario'
  | 'entranharPareceresProcessoEdocs'
  | 'entranharParecerGEOCdocs'
  | 'capturarparecerGEOC'
  | 'salvarAposElaboracao'
  | 'exportar';

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
      texto: 'Salvar Rascunho',
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
      texto: 'Salvar e Enviar',
      acao: 'enviar',
    },
    prospectar: {
      classesCSS: ['btn-outline-success'],
      icone: ['fa-solid', 'fa-paper-plane'],
      texto: 'Prospectar',
      acao: 'prospectar',
    },
    autuarEdocs: {
      classesCSS: ['btn-success'],
      icone: ['fa-solid', 'fa-paper-plane'],
      texto: 'Assinar e Autuar',
      acao: 'autuarEdocs',
    },
    revisar: {
      classesCSS: ['btn-outline-warning'],
      icone: ['fa-solid', 'fa-pen-to-square'],
      texto: 'Revisar',
      acao: 'revisar',
    },
    recusar: {
      classesCSS: ['btn-danger'],
      icone: ['fa-solid', 'fa-ban'],
      texto: 'Recusar',
      acao: 'recusar',
    },
    arquivar: {
      classesCSS: ['btn-outline-danger'],
      icone: ['fa-solid', 'fa-box-archive'],
      texto: 'Arquivar',
      acao: 'arquivar',
    },
    complementar: {
      classesCSS: ['btn-primary'],
      icone: ['fa-solid', 'fa-edit'],
      texto: 'Complementar',
      acao: 'complementar',
    },
    parecerestrategicoorcamentario: {
      classesCSS: ['btn-primary'],
      icone: ['fa-solid', 'fa-upload'],
      texto: 'Pedir Parecer',
      acao: 'parecerestrategicoorcamentario',
    },
    salvarparecer: {
      classesCSS: ['btn-success'],
      icone: ['fa-solid', 'fa-save'],
      texto: 'Salvar Parecer',
      acao: 'salvar',
    },
    efetivarparecerestrategicoorcamentario: {
      classesCSS: ['btn-primary'],
      icone: ['fa-solid', 'fa-upload'],
      texto: 'Enviar Parecer',
      acao: 'efetivarparecerestrategicoorcamentario',
    },
    entranharPareceresProcessoEdocs: {
      classesCSS: ['btn-primary'],
      icone: ['fa-solid', 'fa-upload'],
      texto: 'Entranhar Pareceres',
      acao: 'entranharPareceresProcessoEdocs',
    },
    entranharParecerGEOCdocs: {
      classesCSS: ['btn-primary'],
      icone: ['fa-solid', 'fa-upload'],
      texto: 'Entranhar Parecer',
      acao: 'entranharParecerGEOCdocs',
    },
    capturarparecerGEOC: {
      classesCSS: ['btn-primary'],
      icone: ['fa-solid', 'fa-upload'],
      texto: 'Enviar Parecer',
      acao: 'capturarparecerGEOC',
    },
    salvarAposElaboracao: {
      classesCSS: ['btn-success'],
      icone: ['fa-solid', 'fa-save'],
      texto: 'Salvar',
      acao: 'salvar',
    },
    exportar: {
      classesCSS: ['btn-warning'],
      icone: ['fa-solid', 'fa-file-arrow-down'],
      texto: 'Exportar',
      acao: 'exportar',
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
