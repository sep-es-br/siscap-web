import { EquipeModel } from './equipe.model';
import { RateioModel } from './rateio.model';

import { IProjeto, IProjetoForm } from '../interfaces/projeto.interface';
import { IEquipe } from '../interfaces/equipe.interface';

export class ProjetoFormModel implements IProjetoForm {
  public sigla: string;
  public titulo: string;
  public idOrganizacao: number;
  public valorEstimado: number;
  public rateio: RateioModel;
  public objetivo: string;
  public objetivoEspecifico: string;
  public situacaoProblema: string;
  public solucoesPropostas: string;
  public impactos: string;
  public arranjosInstitucionais: string;
  public idResponsavelProponente: number;
  public equipeElaboracao: Array<EquipeModel>;

  constructor(projeto?: IProjeto) {
    this.sigla = projeto?.sigla ?? '';
    this.titulo = projeto?.titulo ?? '';
    this.idOrganizacao = projeto?.idOrganizacao ?? 0;
    this.valorEstimado = projeto?.valorEstimado ?? 0;
    this.rateio = new RateioModel(projeto?.rateio);
    this.objetivo = projeto?.objetivo ?? '';
    this.objetivoEspecifico = projeto?.objetivoEspecifico ?? '';
    this.situacaoProblema = projeto?.situacaoProblema ?? '';
    this.solucoesPropostas = projeto?.solucoesPropostas ?? '';
    this.impactos = projeto?.impactos ?? '';
    this.arranjosInstitucionais = projeto?.arranjosInstitucionais ?? '';
    this.idResponsavelProponente = projeto?.idResponsavelProponente ?? 0;
    this.equipeElaboracao = this.construirEquipeElaboracao(
      projeto?.equipeElaboracao
    );
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

export class ProjetoModel extends ProjetoFormModel implements IProjeto {
  public readonly id: number;
  public readonly idStatus: number;

  constructor(projeto?: IProjeto) {
    super(projeto);
    this.id = projeto?.id ?? 0;
    this.idStatus = projeto?.idStatus ?? 0;
  }
}
