import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { projetos_NoIdEditarGuard } from './no-id-editar.guard';

describe('projetos_NoIdEditarGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() =>
      projetos_NoIdEditarGuard(...guardParameters)
    );

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
