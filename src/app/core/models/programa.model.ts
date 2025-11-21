import { IEquipe } from '../interfaces/equipe.interface';
import { IPrograma, IProgramaForm } from '../interfaces/programa.interface';

import { EquipeModel } from './equipe.model';
import { ValorModel } from './valor.model';

export class ProgramaFormModel implements IProgramaForm {
  public sigla: string;
  public titulo: string;
  public idOrgaoExecutorList: Array<number>;
  public equipeCaptacao: EquipeModel[];

  public idProjetoPropostoList: number[];
  public valor: ValorModel;

  public percentualCustoAdministrativo: number;
  public valorCalculadoTotal: number;
  public nomeagente: string;

  constructor(programaForm?: IProgramaForm) {

    this.sigla = programaForm?.sigla ?? '';
    this.titulo = programaForm?.titulo ?? '';
    this.idOrgaoExecutorList = programaForm?.idOrgaoExecutorList ?? [];
    this.equipeCaptacao = this.construirEquipeCaptação(
      programaForm?.equipeCaptacao
    );

    this.idProjetoPropostoList = programaForm?.idProjetoPropostoList ?? [];

    this.valor = new ValorModel(programaForm?.valor);

    this.percentualCustoAdministrativo = programaForm?.percentualCustoAdministrativo ?? 0;
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
