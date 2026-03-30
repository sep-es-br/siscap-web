import { StatusProjetoEnum } from "../enums/status-projeto.enum";

export interface IStatusProjeto {
    id: number;
    status: StatusProjetoEnum;
    inicioEm: string;
    fimEm: string;
    feitoPor: string;
}