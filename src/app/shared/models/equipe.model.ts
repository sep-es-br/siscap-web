import { IEquipe } from '../interfaces/equipe.interface';

export class EquipeModel implements IEquipe {
  public idPessoa: number = 0;
  public idPapel: number = 0;
  public idStatus: number = 0;
  public justificativa: string | null = null;

  constructor(equipe?: IEquipe) {
    this.idPessoa = equipe?.idPessoa ?? 0;
    this.idPapel = equipe?.idPapel ?? 0;
    this.idStatus = equipe?.idStatus ?? 0;
    this.justificativa = equipe?.justificativa ?? null;
  }
}
