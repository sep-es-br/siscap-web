import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { prospeccoes_NoIdEditarGuard } from './no-id-editar.guard';

describe('prospeccoes_NoIdEditarGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() =>
      prospeccoes_NoIdEditarGuard(...guardParameters)
    );

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
