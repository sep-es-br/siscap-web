import { LotacaoUsuarioEnum } from "../enums/lotacao-usuario.enum";

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
