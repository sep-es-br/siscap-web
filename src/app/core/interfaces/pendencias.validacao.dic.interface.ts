import { AbaProjeto } from "../types/form/aba-projeto.type";

export interface IPendenciaProjeto {
  id: string;
  aba: AbaProjeto;
  nomeAba: string;
  campo: string;
  mensagem: string;
  controlPath?: string;
}