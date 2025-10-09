export interface IEstruturaCamposComplementar {
  name: string;
  label: string;
  mensagemComplementacao?: string;
}

export interface IEstruturaCamposComplementarProjeto {
  idComplemento: number;
  idCampo: string;
  descricaoCampo: string; 
  descricaoComplemento: string;
}
