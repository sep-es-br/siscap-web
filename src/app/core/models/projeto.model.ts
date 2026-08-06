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
import { IStatusProjeto } from '../interfaces/status-projeto.interface';
import { IIndicadorAvulso } from '../interfaces/indicador-avulso.interface';
import { IndicadorAvulsoModel } from './indicador-avulso.model';
import { IAcaoPlanejamentoProjeto } from '../interfaces/acao-planejamento-projeto.interface';

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
  public nomeProponente: string;
  public historico: Array<IStatusProjeto>;
  public indicadoresAvulsosProjeto: Array<IIndicadorAvulso>;
  public odsProjeto: Array<{
    id: number | null;
    idOdsIndicadorExterno: number;
    idOdsProjeto: number | null;
    odsId: number;
    odsOrdem: number;
    odsNome: string;
    odsDescricao: string;
    odsCor: string;
  }>;
  public acoesPlanejamentoProjeto: Array<IAcaoPlanejamentoProjeto>;
  public naoPrevistoNoPpa: boolean | false;

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
    this.nomeProponente = projetoForm?.nomeProponente ?? '';
    this.historico = new Array();

    this.indicadoresAvulsosProjeto = this.montarIndicadorAvulsoProjeto( projetoForm?.indicadoresAvulsosProjeto ?? [] );

    this.odsProjeto = projetoForm?.odsProjeto ?? [];

    this.acoesPlanejamentoProjeto = projetoForm?.acoesPlanejamentoProjeto ?? [];

    this.naoPrevistoNoPpa = projetoForm?.naoPrevistoNoPpa ?? false;

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

  private construirIndicadoresAvulsosProjeto(
    indicadoresAvulsosProjeto?: Array<IIndicadorAvulso>): Array<IndicadorAvulsoModel> {

    if (!indicadoresAvulsosProjeto) {
      return [];
    }

    return indicadoresAvulsosProjeto.map((indicadorAvulso) => new IndicadorAvulsoModel(indicadorAvulso));

  }

  private construirAcoesProjeto(
    acoesProjeto?: Array<IAcao>
  ): Array<AcaoModel> {
    if (!acoesProjeto) {
      return [];
    }
    return acoesProjeto.map((acoes) => new AcaoModel(acoes));
  }

  private montarIndicadorAvulsoProjeto(item: Array<any>): Array<IndicadorAvulsoModel> {

    return item?.map( (indicadorAvulso) => ({

      id: indicadorAvulso?.id ?? 0,

      // aqui eu usaria o id do indicador avulso real
      idIndicador: indicadorAvulso?.idIndicadorAvulso ?? indicadorAvulso?.indicadorAvulso?.id ?? 0,

      nomeIndicador: indicadorAvulso?.indicadorAvulso?.nomeIndicador ?? null,
      formulaCalculo: indicadorAvulso?.indicadorAvulso?.formulaCalculo ?? null,
      fonteIndicador: indicadorAvulso?.indicadorAvulso?.fonteIndicador ?? null,
      medidoPor: indicadorAvulso?.indicadorAvulso?.medidoPor ?? null,
      unidadeMedida: indicadorAvulso?.indicadorAvulso?.unidadeMedida ?? null,

      // atenção: API vem baseDeReferencia, interface usa basedeReferencia
      basedeReferencia: indicadorAvulso?.indicadorAvulso?.baseDeReferencia ?? null,

      metasIndicadorProjeto:
        indicadorAvulso?.metasIndicadorProjeto?.map((meta: any) => ({
          id: meta?.id ?? 0,
          anoMeta: meta?.anoMeta ?? null,
          valorMeta: meta?.valorMeta ?? null
        })) ?? []
      })) ?? [];

    };

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
    this.historico = projeto?.historico ?? [];
  }

}
