import { EquipeModel } from './equipe.model';
import { RateioModel } from './rateio.model';
import { ValorModel } from './valor.model';

import { IProjeto, IProjetoForm } from '../interfaces/projeto.interface';
import { IEquipe } from '../interfaces/equipe.interface';
import { IRateio } from '../interfaces/rateio.interface';
import { IIndicadores } from '../interfaces/indicadores.interface';
import { IndicadorModel } from './indicador.model';
import { IAcao } from '../interfaces/acoes.interface';
import { AcaoModel } from './acao.model';
import { IEstruturaCamposComplementar, IEstruturaCamposComplementarProjeto } from '../interfaces/estrutura.campo.complementar.dic.interface';
import { IParecer } from '../interfaces/parecer.interface';
import { LotacaoUsuarioEnum } from '../enums/lotacao-usuario.enum';

export class ProjetoFormModel implements IProjetoForm {
  public sigla: string;
  public titulo: string;
  public idOrganizacao: number;
  public valor: ValorModel;
  public rateio: Array<RateioModel>;
  public objetivo: string;
  public objetivoEspecifico: string;
  public situacaoProblema: string;
  public solucoesPropostas: string;
  public impactos: string;
  public arranjosInstitucionais: string;
  public idResponsavelProponente: number;
  public equipeElaboracao: Array<EquipeModel>;
  public rascunho: boolean;
  public nomeResponsavelProponente: string;
  public papelResponsavelProponente: string;
  public subResponsavelProponente: string;
  public indicadoresProjeto: Array<IIndicadores>; 
  public acoesProjeto: Array<IAcao>;
  public nomeagente: string;
  public pecasPlanejamento: string;
  public enviarProjetoGestor: boolean;
  public justificativaRevisao: string;
  public justificativaArquivamento: string;
  public protocoloEdocs: string;
  public codigoMotivoArquivamento: string;
  public lotacaoProponenteResponsavel: string;
  public nomeProponenteResponsavel: string;
  public podeEditar: boolean;
  public podeSolicitarComplementacao: boolean;
  public podeResponderComplementacao: boolean;
  public enviarProjetoPedirParecer: boolean;
  public camposComplementar: Array<IEstruturaCamposComplementarProjeto>;
  public parecerProjetoUsuario: IParecer
  public lotacaoUsuario: number;
  public pareceresProjeto: Array<IParecer>;
  public subProponente: string;

  constructor(projetoForm?: IProjetoForm) {
    this.sigla = projetoForm?.sigla ?? '';
    this.titulo = projetoForm?.titulo ?? '';
    this.idOrganizacao = projetoForm?.idOrganizacao ?? 0;
    this.valor = new ValorModel(projetoForm?.valor);
    this.rateio = this.construirRateioModelArray(projetoForm?.rateio);
    this.objetivo = projetoForm?.objetivo ?? '';
    this.objetivoEspecifico = projetoForm?.objetivoEspecifico ?? '';
    this.situacaoProblema = projetoForm?.situacaoProblema ?? '';
    this.solucoesPropostas = projetoForm?.solucoesPropostas ?? '';
    this.impactos = projetoForm?.impactos ?? '';
    this.arranjosInstitucionais = projetoForm?.arranjosInstitucionais ?? '';
    this.idResponsavelProponente = projetoForm?.idResponsavelProponente ?? 0;
    this.equipeElaboracao = this.construirEquipeElaboracao(
      projetoForm?.equipeElaboracao
    );
    this.rascunho = false;
    this.nomeResponsavelProponente = projetoForm?.nomeResponsavelProponente ?? '';
    this.papelResponsavelProponente = projetoForm?.papelResponsavelProponente ?? '';
    this.subResponsavelProponente = projetoForm?.subResponsavelProponente ?? '';
    this.indicadoresProjeto = this.construirIndicadoresProjeto(
      projetoForm?.indicadoresProjeto
    );
    this.acoesProjeto = this.construirAcoesProjeto(
      projetoForm?.acoesProjeto
    );
    this.nomeagente = projetoForm?.nomeagente ?? '';
    this.pecasPlanejamento = projetoForm?.pecasPlanejamento ?? '';
    this.enviarProjetoGestor = projetoForm?.enviarProjetoGestor ?? false;
    this.justificativaRevisao = projetoForm?.justificativaRevisao ?? '';
    this.justificativaArquivamento = projetoForm?.justificativaArquivamento ?? '';
    this.protocoloEdocs = projetoForm?.protocoloEdocs ?? '';
    this.codigoMotivoArquivamento = projetoForm?.codigoMotivoArquivamento ?? '';
    this.lotacaoProponenteResponsavel = projetoForm?.lotacaoProponenteResponsavel ?? '';
    this.nomeProponenteResponsavel = projetoForm?.nomeProponenteResponsavel ?? '';
    this.podeEditar = projetoForm?.podeEditar ?? false;
    this.podeSolicitarComplementacao = projetoForm?.podeSolicitarComplementacao ?? false;
    this.podeResponderComplementacao = projetoForm?.podeResponderComplementacao ?? false;
    this.enviarProjetoPedirParecer = projetoForm?.enviarProjetoPedirParecer ?? false;
    this.camposComplementar = projetoForm?.camposComplementar ?? [];
    this.parecerProjetoUsuario = projetoForm?.parecerProjetoUsuario ?? ({} as IParecer);
    this.lotacaoUsuario = projetoForm?.lotacaoUsuario ?? 0;
    this.pareceresProjeto = projetoForm?.pareceresProjeto ?? [];
    this.subProponente = projetoForm?.subProponente ?? '';
  }

  private construirRateioModelArray(
    rateioArray?: Array<IRateio>
  ): Array<RateioModel> {
    if (!rateioArray) {
      return [];
    }
    return rateioArray.map((rateio) => new RateioModel(rateio));
  }

  private construirEquipeElaboracao(
    equipeElaboracao?: Array<IEquipe>
  ): Array<EquipeModel> {
    if (!equipeElaboracao) {
      return [];
    }
    return equipeElaboracao.map((equipe) => new EquipeModel(equipe));
  }

  private construirIndicadoresProjeto(
    indicadoresProjeto?: Array<IIndicadores>
  ): Array<IndicadorModel> {
    if (!indicadoresProjeto) {
      return [];
    }
    return indicadoresProjeto.map((indicadores) => new IndicadorModel(indicadores));
  }

  private construirAcoesProjeto(
    acoesProjeto?: Array<IAcao>
  ): Array<AcaoModel> {
    if (!acoesProjeto) {
      return [];
    }
    return acoesProjeto.map((acoes) => new AcaoModel(acoes));
  }

}

export class ProjetoModel extends ProjetoFormModel implements IProjeto {
  public readonly id: number;
  public readonly idStatus: number;
  public readonly status: string;

  constructor(projeto?: IProjeto) {
    super(projeto);
    this.id = projeto?.id ?? 0;
    this.idStatus = projeto?.idStatus ?? 0;
    this.status = projeto?.status ?? '';
  }
}
