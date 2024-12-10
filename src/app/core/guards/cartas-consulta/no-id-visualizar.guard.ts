import { inject } from '@angular/core';
import { CanActivateFn, createUrlTreeFromSnapshot } from '@angular/router';

import { CartasConsultaService } from '../../services/cartas-consulta/cartas-consulta.service';

export const cartasConsulta_NoIdVisualizarGuard: CanActivateFn = (
  route,
  state
) => {
  const idCartaConsultaDetalhesValue: number = inject(CartasConsultaService)
    .idCartaConsultaDetalhes$.value;

  if (idCartaConsultaDetalhesValue) {
    return true;
  }

  return createUrlTreeFromSnapshot(route, ['..']);
};
