import { TestBed } from '@angular/core/testing';

import { CartasConsultaService } from './cartas-consulta.service';

describe('CartasConsultaService', () => {
  let service: CartasConsultaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartasConsultaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
