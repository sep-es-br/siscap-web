import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { pessoas_NoIdEditarGuard } from './no-id-editar.guard';

describe('pessoas_NoIdEditarGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() =>
      pessoas_NoIdEditarGuard(...guardParameters)
    );

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
