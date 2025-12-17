export interface IOpcoesDropdown {
  id: number;
  nome: string;
}

export interface IProjetoPropostoOpcoesDropdown extends IOpcoesDropdown {
  valorEstimado: number;
  idPrograma: number | null;
}

export interface IMotivoArquivamentoOpcoesDropdown extends IOpcoesDropdown {
  tipo: string;
  codigo: string;
}

export interface IObjetoOpcoesDropdown extends IOpcoesDropdown {
  tipo: string;
}

export interface ILocalidadeOpcoesDropdown extends IOpcoesDropdown {
  tipo: string;
  idLocalidadePai: number;
}

export interface IProspeccaoInteressadoOpcoesDropdown extends IOpcoesDropdown {
  email: string;
  idsOrganizacoesList: Array<number>;
}

export interface IOpcoesDropdownResponsavelProponente {
  id: number;
  nome: string;
  papelPrioritario: string;
  agentePublicoSub: string;
  gestorOrganizacao: boolean;
}

export interface IOpcoesDropdownDestinatariosCartaConsulta {
  id: number;
  nomeOrganizacao: string;
  idCartaConsulta: number;
  idOrganizacao: number;
}

export interface IOpcoesDropdownDestinatariosOpcoes {
  nomeOrganizacao: string;
  idOrganizacao: number;
}