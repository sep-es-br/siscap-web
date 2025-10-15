import { StatusParecerEnum } from "../enums/status-parecer.enum";

export interface IParecer {

  id: number;
	idProjeto: number;
	guidUnidadeOrganizacao: string | null;
	textoParecer: string | null;
  statusParecer: StatusParecerEnum;
	dataEnvio: Date;
	guidDocumentoEdocs: string

}
