import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { breadcrumbBotoesAcao_FormResolver } from './form.resolver';

import { IBreadcrumbBotaoAcao } from '../../interfaces/breadcrumb.interface';

describe('breadcrumbBotoesAcao_FormResolver', () => {
  const executeResolver: ResolveFn<IBreadcrumbBotaoAcao> = (
    ...resolverParameters
  ) =>
    TestBed.runInInjectionContext(() =>
      breadcrumbBotoesAcao_FormResolver(...resolverParameters)
    );

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
