import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { cartasConsulta_NoIdEditarGuard } from './no-id-editar.guard';

describe('cartasConsulta_NoIdEditarGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() =>
      cartasConsulta_NoIdEditarGuard(...guardParameters)
    );

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
