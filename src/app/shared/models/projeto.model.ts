import { FormControl, FormArray, FormGroup } from '@angular/forms';

import { EquipeFormModel, EquipeModel } from './equipe.model';
import { RateioFormModel, RateioModel } from './rateio.model';

import { IProjeto, IProjetoForm } from '../interfaces/projeto.interface';

export class ProjetoModel implements IProjeto {
  private readonly _id: number = 0;
  private readonly _idStatus: number = 0;
  public sigla: string = '';
  public titulo: string = '';
  public idOrganizacao: number = 0;
  public valorEstimado: number = 0;
  public rateio: RateioModel[];
  public objetivo: string = '';
  public objetivoEspecifico: string = '';
  public situacaoProblema: string = '';
  public solucoesPropostas: string = '';
  public impactos: string = '';
  public arranjosInstitucionais: string = '';
  public idResponsavelProponente: number = 0;
  public equipeElaboracao: EquipeModel[] = [];

  constructor(projeto?: IProjeto) {
    this._id = projeto?.id ?? 0;
    this._idStatus = projeto?.idStatus ?? 0;
    this.sigla = projeto?.sigla ?? '';
    this.titulo = projeto?.titulo ?? '';
    this.idOrganizacao = projeto?.idOrganizacao ?? 0;
    this.valorEstimado = projeto?.valorEstimado ?? 0;
    this.rateio = projeto?.rateio ?? [];
    this.objetivo = projeto?.objetivo ?? '';
    this.objetivoEspecifico = projeto?.objetivoEspecifico ?? '';
    this.situacaoProblema = projeto?.situacaoProblema ?? '';
    this.solucoesPropostas = projeto?.solucoesPropostas ?? '';
    this.impactos = projeto?.impactos ?? '';
    this.arranjosInstitucionais = projeto?.arranjosInstitucionais ?? '';
    this.idResponsavelProponente = projeto?.idResponsavelProponente ?? 0;
    this.equipeElaboracao = projeto?.equipeElaboracao ?? [];
  }

  public get id() {
    return this._id;
  }

  public get idStatus() {
    return this._idStatus;
  }
}

export class ProjetoFormModel implements IProjetoForm {
  public sigla: FormControl<string | null> = new FormControl(null);
  public titulo: FormControl<string | null> = new FormControl(null);
  public idOrganizacao: FormControl<number | null> = new FormControl(null);
  public valorEstimado: FormControl<number | null> = new FormControl(null);
  public rateio: FormArray<FormGroup<RateioFormModel>> = new FormArray<
    FormGroup<RateioFormModel>
  >([]);
  public objetivo: FormControl<string | null> = new FormControl(null);
  public objetivoEspecifico: FormControl<string | null> = new FormControl(null);
  public situacaoProblema: FormControl<string | null> = new FormControl(null);
  public solucoesPropostas: FormControl<string | null> = new FormControl(null);
  public impactos: FormControl<string | null> = new FormControl(null);
  public arranjosInstitucionais: FormControl<string | null> = new FormControl(
    null
  );
  public idResponsavelProponente: FormControl<number | null> = new FormControl(
    null
  );
  public equipeElaboracao: FormArray<FormGroup<EquipeFormModel>> =
    new FormArray<FormGroup<EquipeFormModel>>([]);

  constructor(projeto?: IProjeto) {
    this.sigla.setValue(projeto?.sigla ?? null);
    this.titulo.setValue(projeto?.titulo ?? null);
    this.idOrganizacao.setValue(projeto?.idOrganizacao ?? null);
    this.valorEstimado.setValue(projeto?.valorEstimado ?? null);
    this.rateio.setValue(projeto?.rateio ?? []);
    this.objetivo.setValue(projeto?.objetivo ?? null);
    this.objetivoEspecifico.setValue(projeto?.objetivoEspecifico ?? null);
    this.situacaoProblema.setValue(projeto?.situacaoProblema ?? null);
    this.solucoesPropostas.setValue(projeto?.solucoesPropostas ?? null);
    this.impactos.setValue(projeto?.impactos ?? null);
    this.arranjosInstitucionais.setValue(
      projeto?.arranjosInstitucionais ?? null
    );
    this.idResponsavelProponente.setValue(
      projeto?.idResponsavelProponente ?? null
    );
    this.equipeElaboracao.setValue(projeto?.equipeElaboracao ?? []);
  }
}
