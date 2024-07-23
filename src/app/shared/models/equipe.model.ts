import { FormControl } from '@angular/forms';

import { IEquipe, IEquipeForm } from '../interfaces/equipe.interface';

export class EquipeModel implements IEquipe {
  public idPessoa: number = 0;
  public idPapel: number = 0;
  public idStatus: number = 0;
  public justificativa: string = '';

  constructor(equipe?: IEquipe) {
    this.idPessoa = equipe?.idPessoa ?? 0;
    this.idPapel = equipe?.idPapel ?? 0;
    this.idStatus = equipe?.idStatus ?? 0;
    this.justificativa = equipe?.justificativa ?? '';
  }
}

export class EquipeFormModel implements IEquipeForm {
  public idPessoa: FormControl<number | null> = new FormControl(null);
  public idPapel: FormControl<number | null> = new FormControl(null);
  public idStatus: FormControl<number | null> = new FormControl(null);
  public justificativa: FormControl<string | null> = new FormControl(null);

  constructor(equipe?: IEquipe) {
    this.idPessoa.setValue(equipe?.idPessoa ?? null);
    this.idPapel.setValue(equipe?.idPapel ?? null);
    this.idStatus.setValue(equipe?.idStatus ?? null);
    this.justificativa.setValue(equipe?.justificativa ?? null);
  }
}
