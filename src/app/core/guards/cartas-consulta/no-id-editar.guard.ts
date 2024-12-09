import { inject } from '@angular/core';
import { CanActivateFn, createUrlTreeFromSnapshot } from '@angular/router';

import { CartasConsultaService } from '../../services/cartas-consulta/cartas-consulta.service';

export const cartasConsulta_NoIdEditarGuard: CanActivateFn = (route, state) => {
  const idCartaConsultaValue: number =
    inject(CartasConsultaService).idCartaConsulta$.value;

  if (idCartaConsultaValue) {
    return true;
  }

  return createUrlTreeFromSnapshot(route, ['..']);
};
