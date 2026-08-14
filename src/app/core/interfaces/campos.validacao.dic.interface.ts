import { AbaProjeto } from "../types/form/aba-projeto.type";

export interface ICamposValidacao {
  path: string;
  campo: string;
  aba: AbaProjeto;
  nomeAba: String;
}