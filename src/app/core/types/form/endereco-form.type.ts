import { FormControl } from '@angular/forms';

export type EnderecoFormType = {
  rua: FormControl<string | null>;
  numero: FormControl<number | null>;
  bairro: FormControl<string | null>;
  complemento: FormControl<string | null>;
  codigoPostal: FormControl<string | null>;
  idCidade: FormControl<number | null>;
  idEstado: FormControl<number | null>;
  idPais: FormControl<number | null>;
};

export type EnderecoFormTypeValue = Partial<{
  rua: string | null;
  numero: number | null;
  bairro: string | null;
  complemento: string | null;
  codigoPostal: string | null;
  idCidade: number | null;
  idEstado: number | null;
  idPais: number | null;
}>;
