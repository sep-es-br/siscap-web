import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { organizacoes_NoIdEditarGuard } from './no-id-editar.guard';

describe('organizacoes_NoIdEditarGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() =>
      organizacoes_NoIdEditarGuard(...guardParameters)
    );

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
