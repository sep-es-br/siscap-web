import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { programas_NoIdEditarGuard } from './no-id-editar.guard';

describe('programas_NoIdEditarGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() =>
      programas_NoIdEditarGuard(...guardParameters)
    );

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
