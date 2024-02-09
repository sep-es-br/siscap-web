import { IProjectCreate } from '../interfaces/projectCreate.interface';

export class projectCreateModel implements IProjectCreate {
  sigla: string = '';
  titulo: string = '';
  idEntidade: number = 0;
  valorEstimado: number = 0;
  idMicrorregioes: number[] = [];
  objetivo: string = '';
  objetivoEspecifico: string = '';
  situacaoProblema: string = '';
  solucoesPropostas: string = '';
  impactos: string = '';
  arranjosInstitucionais: string = '';

  constructor(
    sigla: string,
    titulo: string,
    idEntidade: number,
    valorEstimado: number,
    idMicrorregioes: number[],
    objetivo: string,
    objetivoEspecifico: string,
    situacaoProblema: string,
    solucoesPropostas: string,
    impactos: string,
    arranjosInstitucionais: string
  ) {
    this.sigla = sigla;
    this.titulo = titulo;
    this.idEntidade = idEntidade;
    this.valorEstimado = valorEstimado;
    this.idMicrorregioes = idMicrorregioes;
    this.objetivo = objetivo;
    this.objetivoEspecifico = objetivoEspecifico;
    this.situacaoProblema = situacaoProblema;
    this.solucoesPropostas = solucoesPropostas;
    this.impactos = impactos;
    this.arranjosInstitucionais = arranjosInstitucionais;
  }
}
