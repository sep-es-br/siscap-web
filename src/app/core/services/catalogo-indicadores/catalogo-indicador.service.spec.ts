import { TestBed } from '@angular/core/testing';

import { CatalogoIndicadorService } from './catalogo-indicador.service';

describe('CatalogoIndicadorService', () => {
  let service: CatalogoIndicadorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CatalogoIndicadorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
