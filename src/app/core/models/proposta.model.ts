import { IEquipe } from '../interfaces/equipe.interface';
import { IProposta, IPropostaForm } from '../interfaces/propostas.interface';
import { EquipeModel } from './equipe.model';

export class PropostaFormModel implements IPropostaForm {
  public sigla: string;
  public titulo: string;
  public idOrganizacao: number;
  public objetivo: string;
  public objetivoEspecifico: string;
  public situacaoProblema: string;
  public solucoesPropostas: string;
  public impactos: string;
  public arranjosInstitucionais: string;
  public idResponsavelProponente: number;
  public equipeElaboracao: EquipeModel[];
  public valorEstimado: number;
  public idMicrorregioesList: number[];

  constructor(propostaForm?: IPropostaForm) {
    this.sigla = propostaForm?.sigla ?? '';
    this.titulo = propostaForm?.titulo ?? '';
    this.idOrganizacao = propostaForm?.idOrganizacao ?? 0;
    this.objetivo = propostaForm?.objetivo ?? '';
    this.objetivoEspecifico = propostaForm?.objetivoEspecifico ?? '';
    this.situacaoProblema = propostaForm?.situacaoProblema ?? '';
    this.solucoesPropostas = propostaForm?.solucoesPropostas ?? '';
    this.impactos = propostaForm?.impactos ?? '';
    this.arranjosInstitucionais = propostaForm?.arranjosInstitucionais ?? '';
    this.idResponsavelProponente = propostaForm?.idResponsavelProponente ?? 0;
    this.equipeElaboracao = this.construirEquipeElaboracao(
      propostaForm?.equipeElaboracao
    );
    this.valorEstimado = propostaForm?.valorEstimado ?? 0;
    this.idMicrorregioesList = propostaForm?.idMicrorregioesList ?? [];
  }

  private construirEquipeElaboracao(
    equipeElaboracao?: Array<IEquipe>
  ): Array<EquipeModel> {
    if (!equipeElaboracao) {
      return [];
    }

    return equipeElaboracao.map((equipe) => new EquipeModel(equipe));
  }
}

export class PropostaModel extends PropostaFormModel implements IProposta {
  public readonly id: number;
  public readonly idStatus: number;

  constructor(proposta?: IProposta) {
    super(proposta);
    this.id = proposta?.id ?? 0;
    this.idStatus = proposta?.idStatus ?? 0;
  }
}
