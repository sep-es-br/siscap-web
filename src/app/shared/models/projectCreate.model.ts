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

// Potencial ideia para otimizar processo

// export class ProjectCreateModel implements FormFactoryControlObject<IProjectCreate> {
//   sigla: IFormFactoryControl<IProjectCreate['sigla']> = {
//     initialValue: '',
//     validators: {
//       required: true,
//       maxLength: 12,
//     },
//   };

//   titulo: IFormFactoryControl<IProjectCreate['titulo']> = {
//     initialValue: '',
//     validators: {
//       required: true,
//       maxLength: 150,
//     },
//   };

//   idEntidade: IFormFactoryControl<IProjectCreate['idEntidade']> = {
//     initialValue: null,
//     validators: {
//       required: true,
//       min: 1,
//     },
//   };

//   valorEstimado: IFormFactoryControl<IProjectCreate['valorEstimado']> = {
//     initialValue: null,
//     validators: {
//       required: true,
//       min: 1,
//     },
//   };

//   idMicrorregioes: IFormFactoryControl<IProjectCreate['idMicrorregioes']> = {
//     initialValue: [],
//     validators: {
//       required: true,
//     },
//   };

//   objetivo: IFormFactoryControl<IProjectCreate['objetivo']> = {
//     initialValue: '',
//     validators: {
//       required: true,
//       maxLength: 2000,
//     },
//   };

//   objetivoEspecifico: IFormFactoryControl<IProjectCreate['objetivoEspecifico']> = {
//     initialValue: '',
//     validators: {
//       required: true,
//       maxLength: 2000,
//     },
//   };

//   situacaoProblema: IFormFactoryControl<IProjectCreate['situacaoProblema']> = {
//     initialValue: '',
//     validators: {
//       required: true,
//       maxLength: 2000,
//     },
//   };

//   solucoesPropostas: IFormFactoryControl<IProjectCreate['solucoesPropostas']> = {
//     initialValue: '',
//     validators: {
//       required: true,
//       maxLength: 2000,
//     },
//   };

//   impactos: IFormFactoryControl<IProjectCreate['impactos']> = {
//     initialValue: '',
//     validators: {
//       required: true,
//       maxLength: 2000,
//     },
//   };

//   arranjosInstitucionais: IFormFactoryControl<IProjectCreate['arranjosInstitucionais']> = {
//     initialValue: '',
//     validators: {
//       required: true,
//       maxLength: 2000,
//     },
//   };

//   constructor() {}
// }
