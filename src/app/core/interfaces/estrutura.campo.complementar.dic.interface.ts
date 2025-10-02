export interface IEstruturaCamposComplementar {
  name: string;
  label: string;
  mensagemComplementacao?: string;
}

export interface IEstruturaCamposComplementarProjeto {
  idComplemento: number;
  descricaoCampo: string; 
  descricaoComplemento: string;
}
