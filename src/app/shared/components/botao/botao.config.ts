import { MENSAGENS } from '../../../core/utils/constants';
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
  | 'exportar'
  | 'solicitarAutorizacao'
  | 'autuar'
  | 'fechar'
  | 'pendenciasDic';

export abstract class BotoesConfig {
  private static readonly BOTOESCONFIG_BASE: Record<
    TBotaoAcao,
    IBotaoPropriedades
  > = {
    confirmar: {
      classesCSS: ['btn-success', 'btn-sm'],
      icone: ['fa-solid', 'fa-thumbs-up'],
      texto: MENSAGENS.CONFIRMAR,
      acao: 'confirmar',
    },
    criar: {
      classesCSS: ['btn-outline-primary', 'btn-sm'],
      icone: ['fa-solid', 'fa-plus'],
      texto: MENSAGENS.CRIAR,
      acao: 'criar',
    },
    cancelar: {
      classesCSS: ['btn-outline-danger', 'btn-sm'],
      icone: ['fa-solid', 'fa-close'],
      texto: MENSAGENS.CANCELAR,
      acao: 'cancelar',
    },
    voltar: {
      classesCSS: ['btn-outline-primary', 'btn-sm'],
      icone: ['fa-solid', 'fa-arrow-turn-up', 'fa-rotate-270'],
      texto: MENSAGENS.VOLTAR,
      acao: 'voltar',
    },
    salvar: {
      classesCSS: ['btn-success', 'btn-sm'],
      icone: ['fa-solid', 'fa-save'],
      texto: MENSAGENS.SALVAR,
      acao: 'salvar',
    },
    editar: {
      classesCSS: ['btn-primary', 'btn-sm'],
      icone: ['fa-solid', 'fa-edit'],
      texto: MENSAGENS.EDITAR,
      acao: 'editar',
    },
    deletar: {
      classesCSS: ['btn-danger', 'btn-sm'],
      icone: ['fa-solid', 'fa-trash'],
      texto: MENSAGENS.DELETAR,
      acao: 'deletar',
    },
    enviar: {
      classesCSS: ['btn-primary', 'btn-sm'],
      icone: ['fa-solid', 'fa-upload'],
      texto: MENSAGENS.ENVIAR,
      acao: 'enviar',
    },
    prospectar: {
      classesCSS: ['btn-outline-success', 'btn-sm'],
      icone: ['fa-solid', 'fa-paper-plane'],
      texto: MENSAGENS.PROSPECTAR,
      acao: 'prospectar',
    },
    autuarEdocs: {
      classesCSS: ['btn-success', 'btn-sm'],
      icone: ['fa-solid', 'fa-paper-plane'],
      texto: MENSAGENS.ASSINAR_E_AUTUAR,
      acao: 'autuarEdocs',
    },
    revisar: {
      classesCSS: ['btn-outline-warning', 'btn-sm'],
      icone: ['fa-solid', 'fa-pen-to-square'],
      texto: MENSAGENS.REVISAR,
      acao: 'revisar',
    },
    recusar: {
      classesCSS: ['btn-danger', 'btn-sm'],
      icone: ['fa-solid', 'fa-ban'],
      texto: MENSAGENS.RECUSAR,
      acao: 'recusar',
    },
    arquivar: {
      classesCSS: ['btn-outline-danger', 'btn-sm'],
      icone: ['fa-solid', 'fa-box-archive'],
      texto: MENSAGENS.ARQUIVAR,
      acao: 'arquivar',
    },
    complementar: {
      classesCSS: ['btn-primary', 'btn-sm'],
      icone: ['fa-solid', 'fa-edit'],
      texto: MENSAGENS.COMPLEMENTAR,
      acao: 'complementar',
    },
    parecerestrategicoorcamentario: {
      classesCSS: ['btn-primary', 'btn-sm'],
      icone: ['fa-solid', 'fa-upload'],
      texto: MENSAGENS.PEDIR_PARECER,
      acao: 'parecerestrategicoorcamentario',
    },
    salvarparecer: {
      classesCSS: ['btn-success', 'btn-sm'],
      icone: ['fa-solid', 'fa-save'],
      texto: MENSAGENS.SALVAR_PARECER,
      acao: 'salvar',
    },
    efetivarparecerestrategicoorcamentario: {
      classesCSS: ['btn-primary', 'btn-sm'],
      icone: ['fa-solid', 'fa-upload'],
      texto: MENSAGENS.ENVIAR_PARECER,
      acao: 'efetivarparecerestrategicoorcamentario',
    },
    entranharPareceresProcessoEdocs: {
      classesCSS: ['btn-primary', 'btn-sm'],
      icone: ['fa-solid', 'fa-upload'],
      texto: MENSAGENS.ENTRANHAR_PARECERES,
      acao: 'entranharPareceresProcessoEdocs',
    },
    entranharParecerGEOCdocs: {
      classesCSS: ['btn-primary', 'btn-sm'],
      icone: ['fa-solid', 'fa-upload'],
      texto: MENSAGENS.ENTRANHAR_PARECER,
      acao: 'entranharParecerGEOCdocs',
    },
    capturarparecerGEOC: {
      classesCSS: ['btn-primary', 'btn-sm'],
      icone: ['fa-solid', 'fa-gavel'],
      texto: MENSAGENS.CONCLUIR_PARECER,
      acao: 'capturarparecerGEOC',
    },
    salvarAposElaboracao: {
      classesCSS: ['btn-success', 'btn-sm'],
      icone: ['fa-solid', 'fa-save'],
      texto: MENSAGENS.SALVAR,
      acao: 'salvar',
    },
    exportar: {
      classesCSS: ['btn-warning', 'btn-sm'],
      icone: ['fa-solid', 'fa-file-arrow-down'],
      texto: MENSAGENS.EXPORTAR,
      acao: 'exportar',
    },
    solicitarAutorizacao: {
      classesCSS: ['btn-success', 'btn-sm'],
      icone: ['fa-solid', 'fa-share'],
      texto: MENSAGENS.SOLICITAR_AUTORIZACAO,
      acao: 'solicitarAutorizacao',
    },
    autuar: {
      classesCSS: ['btn-success', 'btn-sm'],
      icone: ['fa-solid fa-folder-plus'],
      texto: MENSAGENS.AUTUAR,
      acao: 'autuar',
    },
    fechar: {
      classesCSS: ['btn-secondary', 'btn-sm'],
      icone: [],
      texto: MENSAGENS.FECHAR,
      acao: 'fechar',
    },
    pendenciasDic: {
      classesCSS: ['btn-primary', 'btn-sm'],
      icone: ['fa-solid fa-list-check'],
      texto: MENSAGENS.PENDENCIAS,
      acao: 'pendenciasDic',
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
