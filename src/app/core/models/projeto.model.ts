import { EquipeModel } from './equipe.model';
import { RateioModel } from './rateio.model';
import { ValorModel } from './valor.model';

import { IProjeto, IProjetoForm } from '../interfaces/projeto.interface';
import { IEquipe } from '../interfaces/equipe.interface';
import { IRateio } from '../interfaces/rateio.interface';

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
