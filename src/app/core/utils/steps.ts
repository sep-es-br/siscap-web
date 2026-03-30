import { LotacaoUsuarioEnum } from "../enums/lotacao-usuario.enum";
import { StatusParecerEnum } from "../enums/status-parecer.enum";
import { StatusProjetoEnum } from "../enums/status-projeto.enum";
import { IParecer } from "../interfaces/parecer.interface";
import { IProgramaStatus, StatusPrograma, StatusProgramaLabel } from "../interfaces/programa.interface";
import { IStatusProjeto } from '../interfaces/status-projeto.interface';

export interface IStep<T> {
    label: string;
    status: T;
    dataInicio: Date;
    dataFim: Date;
    nomePessoa: string;
    positivo: boolean;
    isFinalizado: () => boolean;
    isAtual: () => boolean;
    isInativo: () => boolean;

}

export function gerarStepStatusProjeto(status: StatusProjetoEnum, statusHistorico: IStatusProjeto | undefined, pareceres: IParecer[], subeoSubepp: boolean): IStep<StatusProjetoEnum> {
    const base = {
        label: status,
        status: status,
        dataInicio: statusHistorico?.inicioEm && new Date(statusHistorico.inicioEm) ,
        dataFim: statusHistorico?.fimEm && new Date(statusHistorico?.fimEm),
        nomePessoa: statusHistorico?.feitoPor,
        positivo: true,
        isInativo() {
            return !this.dataInicio;
        },
        isAtual() {
            return !!this.dataInicio && !this.dataFim;
        },
        isFinalizado() {
            return !!this.dataInicio && !!this.dataFim;
        }
    }
    
    switch (status) {
        case StatusProjetoEnum.Em_Elaboracao:
            return {
                ...base,
                label: StatusProjetoEnum.Em_Elaboracao.replace('Em ', '')                
            } as IStep<StatusProjetoEnum>;
        case StatusProjetoEnum.Em_Analise:
            return {
                ...base,
                label: StatusProjetoEnum.Em_Analise.replace('Em ', '') 
            } as IStep<StatusProjetoEnum>;
        case StatusProjetoEnum.Arquivado:
            return {
                ...base,
                positivo: false
            } as IStep<StatusProjetoEnum>;
        case StatusProjetoEnum.Parecer_SEP:

            const parecerSubeo = pareceres.find(p => p.parecerLotacao === LotacaoUsuarioEnum.SUBEO);
            const parecerSubepp = pareceres.find(p => p.parecerLotacao === LotacaoUsuarioEnum.SUBEPP);
            const parecerSubcap = pareceres.find(p => p.parecerLotacao === LotacaoUsuarioEnum.SUBCAP);

            const subeoDtEnvio = parecerSubeo?.dataEnvio;
            const subeppDtEnvio = parecerSubepp?.dataEnvio;

            if(subeoSubepp){
                return {
                    ...base,
                    label: 'Parecer SUBEO/SUBEPP',
                    dataFim: (subeoDtEnvio && subeppDtEnvio) ? (subeoDtEnvio > subeppDtEnvio ? subeoDtEnvio : subeppDtEnvio) : undefined,
                    nomePessoa: (subeoDtEnvio && subeppDtEnvio) ? (subeoDtEnvio > subeppDtEnvio ? parecerSubeo.usuarioFezEnvioParecer : parecerSubepp.usuarioFezEnvioParecer) : undefined
                } as IStep<StatusProjetoEnum>;
            } else {
                return {
                    ...base,
                    label: 'Parecer GEOC',
                    dataInicio: (subeoDtEnvio && subeppDtEnvio) ? (subeoDtEnvio > subeppDtEnvio ? subeoDtEnvio : subeppDtEnvio) : undefined,
                } as IStep<StatusProjetoEnum>;
            }
                
        case StatusProjetoEnum.Em_Complementacao:
            return {
                ...base,
                label: StatusProjetoEnum.Em_Complementacao.replace('Em ', '') 
            } as IStep<StatusProjetoEnum>;
        case StatusProjetoEnum.Elegivel:
            return {
               ...base,
               label: statusHistorico?.inicioEm ? StatusProjetoEnum.Elegivel : 'Conclusão'
            } as IStep<StatusProjetoEnum>;
    }
} 

export function gerarStepProgramaStatus(status: StatusPrograma, statusHistorico: IProgramaStatus | undefined, historicoPrograma: IProgramaStatus[]): IStep<StatusPrograma> {
    const base = {
        label: StatusProgramaLabel[status],
        status: status,
        dataInicio: statusHistorico?.inicioEm && new Date(statusHistorico.inicioEm) ,
        dataFim: statusHistorico?.fimEm && new Date(statusHistorico?.fimEm),
        nomePessoa: statusHistorico?.nomePessoa,
        positivo: true,
        isInativo() {
            return !this.dataInicio;
        },
        isAtual() {
            return !!this.dataInicio && !this.dataFim;
        },
        isFinalizado() {
            return !!this.dataInicio && !!this.dataFim;
        }
    }
    
    switch (status) {
        case StatusPrograma.SEM_STATUS:
            return {...base} as IStep<StatusPrograma>;
        case StatusPrograma.EDICAO:
            return {...base} as IStep<StatusPrograma>;
        case StatusPrograma.AGUARDANDO_ASSINATURAS:
            return {...base} as IStep<StatusPrograma>;
        case StatusPrograma.ASSINADO:
            return {...base} as IStep<StatusPrograma>;
        case StatusPrograma.AUTUADO:
            return {
                ...base,
                dataInicio: historicoPrograma.find(h => h.status === StatusPrograma.ASSINADO)?.inicioEm
                
            } as IStep<StatusPrograma>;
        case StatusPrograma.RECUSADO:
            return {
                ...base,
                positivo: false
            } as IStep<StatusPrograma>;


    }

} 