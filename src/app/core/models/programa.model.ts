import { IEquipe } from '../interfaces/equipe.interface';
import { IPrograma, IProgramaForm, IProgramaOrgaosEnvolvidos, StatusPrograma } from '../interfaces/programa.interface';

import { EquipeModel } from './equipe.model';
import { ValorModel } from './valor.model';

export class ProgramaFormModel implements IProgramaForm {
  public equipeCaptacao: EquipeModel[];
  public idProjetoPropostoList: number[];
  public orgaosEnvolvidosList: Array<IProgramaOrgaosEnvolvidos>;
  public percentualCustoAdministrativo: number;
  public sigla: string;
  public statusPrograma: StatusPrograma;
  public titulo: string;
  public valor: ValorModel;

  public valorCalculadoTotal: number;
  public nomeagente: string;

  constructor(programaForm?: IProgramaForm) {
    this.equipeCaptacao = this.construirEquipeCaptação(
      programaForm?.equipeCaptacao
    );
    this.idProjetoPropostoList = programaForm?.idProjetoPropostoList ?? [];
    this.orgaosEnvolvidosList = programaForm?.orgaosEnvolvidosList ?? [];
    this.percentualCustoAdministrativo = programaForm?.percentualCustoAdministrativo ?? 0;
    this.sigla = programaForm?.sigla ?? '';
    this.statusPrograma = programaForm?.statusPrograma ?? StatusPrograma.SEM_STATUS;

    this.titulo = programaForm?.titulo ?? '';
    this.valor = new ValorModel(programaForm?.valor);
    this.valorCalculadoTotal = programaForm?.valorCalculadoTotal ?? 0;

    this.nomeagente = programaForm?.nomeagente ?? '';
  }

  private construirEquipeCaptação(equipeCaptacao?: IEquipe[]): EquipeModel[] {
    if (!equipeCaptacao) {
      return [];
    }

    return equipeCaptacao.map((equipe) => new EquipeModel(equipe));
  }
}

export class ProgramaModel extends ProgramaFormModel implements IPrograma {
  public readonly id: number;

  constructor(programa?: IPrograma) {
    super(programa);
    this.id = programa?.id ?? 0;
  }
}
