import { IEquipe } from '../interfaces/equipe.interface';
import {
  IPrograma,
  IProgramaForm,
  IProgramaProjetoProposto,
} from '../interfaces/programa.interface';

import { EquipeModel } from './equipe.model';
import { ValorModel } from './valor.model';

export class ProgramaProjetoPropostoModel implements IProgramaProjetoProposto {
  valor: number;
  idProjeto: number;

  constructor(programaProjetoProposto?: IProgramaProjetoProposto) {
    this.valor = programaProjetoProposto?.valor ?? 0;
    this.idProjeto = programaProjetoProposto?.idProjeto ?? 0;
  }
}

export class ProgramaFormModel implements IProgramaForm {
  public sigla: string;
  public titulo: string;
  public idOrgaoExecutor: number;
  public equipeCaptacao: EquipeModel[];
  public projetosPropostos: ProgramaProjetoPropostoModel[];
  public valor: ValorModel;

  constructor(programaForm?: IProgramaForm) {
    this.sigla = programaForm?.sigla ?? '';
    this.titulo = programaForm?.titulo ?? '';
    this.idOrgaoExecutor = programaForm?.idOrgaoExecutor ?? 0;
    this.equipeCaptacao = this.construirEquipeCaptação(
      programaForm?.equipeCaptacao
    );
    this.projetosPropostos = this.construirProjetosPropostos(
      programaForm?.projetosPropostos
    );
    this.valor = new ValorModel(programaForm?.valor);
  }

  private construirEquipeCaptação(equipeCaptacao?: IEquipe[]): EquipeModel[] {
    if (!equipeCaptacao) {
      return [];
    }

    return equipeCaptacao.map((equipe) => new EquipeModel(equipe));
  }

  private construirProjetosPropostos(
    projetosPropostos?: Array<IProgramaProjetoProposto>
  ): Array<ProgramaProjetoPropostoModel> {
    if (!projetosPropostos) {
      return [];
    }

    return projetosPropostos.map(
      (projetoProposto) => new ProgramaProjetoPropostoModel(projetoProposto)
    );
  }
}

export class ProgramaModel extends ProgramaFormModel implements IPrograma {
  public readonly id: number;

  constructor(programa?: IPrograma) {
    super(programa);
    this.id = programa?.id ?? 0;
  }
}
