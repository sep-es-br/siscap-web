import { LotacaoUsuarioEnum } from "../enums/lotacao-usuario.enum";
import { StatusParecerEnum } from "../enums/status-parecer.enum";

export interface IParecer {

	id: number;
	idProjeto: number;
	guidUnidadeOrganizacao: string | null;
	textoParecer: string | null;
	statusParecer: number;
	dataEnvio: Date;
	guidDocumentoEdocs: string;
	usuarioFezEnvioParecer: string
	parecerLotacao: LotacaoUsuarioEnum;
	elegivel: boolean;

}
