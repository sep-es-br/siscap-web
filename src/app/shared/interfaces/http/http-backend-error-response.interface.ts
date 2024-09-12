export interface IHttpBackEndErrorResponse {
  status: string;
  codigo: number;
  mensagem: string;
  erros: Array<string>;
}
