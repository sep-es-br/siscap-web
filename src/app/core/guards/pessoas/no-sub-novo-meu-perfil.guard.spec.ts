import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { pessoas_NoSubNovoMeuPerfilGuard } from './no-sub-novo-meu-perfil.guard';

describe('pessoas_NoSubNovoMeuPerfilGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() =>
      pessoas_NoSubNovoMeuPerfilGuard(...guardParameters)
    );

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
