import { IFormFactoryControlObject } from '../interfaces/formFactoryControlObject.interface';

export class projectCreateModel {
  sigla: IFormFactoryControlObject;
  titulo: IFormFactoryControlObject;
  idEntidade: IFormFactoryControlObject;
  valorEstimado: IFormFactoryControlObject;
  idMicrorregioes: IFormFactoryControlObject;
  objetivo: IFormFactoryControlObject;
  objetivoEspecifico: IFormFactoryControlObject;
  situacaoProblema: IFormFactoryControlObject;
  solucoesPropostas: IFormFactoryControlObject;
  impactos: IFormFactoryControlObject;
  arranjosInstitucionais: IFormFactoryControlObject;

  constructor(
    sigla: IFormFactoryControlObject,
    titulo: IFormFactoryControlObject,
    idEntidade: IFormFactoryControlObject,
    valorEstimado: IFormFactoryControlObject,
    idMicrorregioes: IFormFactoryControlObject,
    objetivo: IFormFactoryControlObject,
    objetivoEspecifico: IFormFactoryControlObject,
    situacaoProblema: IFormFactoryControlObject,
    solucoesPropostas: IFormFactoryControlObject,
    impactos: IFormFactoryControlObject,
    arranjosInstitucionais: IFormFactoryControlObject
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
