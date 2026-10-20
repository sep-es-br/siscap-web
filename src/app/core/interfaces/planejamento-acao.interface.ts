export interface PlanejamentoAcao {
  id: number;
  codigoOrgao: string | null;
  siglaOrgao: string | null;
  nomeOrgao: string | null;
  codigoUnidadeOrcamentaria: string | null;
  siglaUnidadeOrcamentaria: string | null;
  nomeUnidadeOrcamentaria: string | null;
  codigoPrograma: string | null;
  nomePrograma: string | null;
  codigoAcao: string | null;
  nomeAcao: string | null;
  codigoFuncao: string | null;
  nomeFuncao: string | null;
  valorPpa: number | null;
  valorLoa: number;
  anoAcao: string;
  detalhamentosLoa: DetalhamentoOrcamentarioLoa[];
  valorTotalDetalhamento?: number;
}

export interface DetalhamentoOrcamentarioLoa {
  codigoGnd: string | null;
  codigoModalidade: string | null;
  idUso: string | null;
  fonte: string | null;
  valor: number | null;
  nomeGrupoDespesa: string | null;
  nomeModalidade: string | null;
  nomeIdUso: string | null;
  nomeFonte: string | null;

}

