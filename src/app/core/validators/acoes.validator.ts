import { FormArray, FormGroup, ValidationErrors } from '@angular/forms';

import { AcaoFormType } from '../types/form/acao-form.type';
import { AcoesService } from '../services/acoes/acoes.service';

export function limiteAcoesValidator(
  quantiaValorEstimadoDIC: number | null,
  acoesService: AcoesService
): ValidationErrors | null {

  if (!quantiaValorEstimadoDIC || !acoesService)
    return null;

  const totalQuantia =
    acoesService.calcularTotalAcoesAtivas();

  if ( totalQuantia > quantiaValorEstimadoDIC || totalQuantia < quantiaValorEstimadoDIC ) {
    return { limiteAcoes: true };
  }

  return null;

}
