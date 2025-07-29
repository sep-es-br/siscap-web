import { IAcao } from './acoes.interface';
import { IEquipe } from './equipe.interface';
import { IIndicadores } from './indicadores.interface';
import { IRateio } from './rateio.interface';
import { IValor } from './valor.interface';

export interface IProjeto {
  readonly id: number;
  readonly idStatus: number;
  readonly status: string;
  sigla: string;
  titulo: string;
  idOrganizacao: number;
  valor: IValor;
  rateio: Array<IRateio>;
  objetivo: string;
  objetivoEspecifico: string;
  situacaoProblema: string;
  solucoesPropostas: string;
  impactos: string;
  arranjosInstitucionais: string;
  idResponsavelProponente: number;
  equipeElaboracao: Array<IEquipe>;
  nomeResponsavelProponente: string;
  papelResponsavelProponente: string;
  subResponsavelProponente: string;
  indicadoresProjeto: Array<IIndicadores>;
  acoesProjeto: Array<IAcao>;
  nomeagente: string;
  pecasPlanejamento: string;
  enviarProjetoGestor: boolean;
  justificativaRevisao: string;
  justificativaArquivamento: string;
  protocoloEdocs: string;
}

export interface IProjetoForm
  extends Omit<IProjeto, 'id' | 'idStatus' | 'status'> {}

export interface IProjetoTableData
  extends Pick<IProjeto, 'id' | 'sigla' | 'titulo' | 'protocoloEdocs'> {
  status: string;
  valorEstimado: number;
  isRascunho: boolean;
  protocoloEdocs: string
}

export interface IProjetoFiltroPesquisa
  extends Pick<IProjeto, 'idOrganizacao' | 'status'> {
  siglaOuTitulo: string;
}
