import { IEquipe } from '../interfaces/equipe.interface';

export class EquipeModel implements IEquipe {
  public subPessoa: string | null = null;
  public idPessoa: number = 0;
  public idPapel: number = 0;
  public idStatus: number = 0;
  public justificativa: string | null = null;
  public nome: string | null;
  public papelNome: string | null;

  constructor(equipe?: IEquipe) {
    this.subPessoa = equipe?.subPessoa ?? null;
    this.idPessoa = equipe?.idPessoa ?? 0;
    this.idPapel = equipe?.idPapel ?? 0;
    this.idStatus = equipe?.idStatus ?? 0;
    this.justificativa = equipe?.justificativa ?? null;
    this.nome = equipe?.nome ?? null;
    this.papelNome = equipe?.papelNome ?? null;
  }
}
