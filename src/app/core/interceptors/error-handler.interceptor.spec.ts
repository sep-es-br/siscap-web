import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ErrorHandlerService } from '../services/error-handler/error-handler.service';
import { errorHandlerInterceptor } from './error-handler.interceptor';

describe('errorHandlerInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  let errorHandler: jasmine.SpyObj<ErrorHandlerService>;

  beforeEach(() => {
    errorHandler = jasmine.createSpyObj<ErrorHandlerService>('ErrorHandlerService', ['handleError']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorHandlerInterceptor])),
        provideHttpClientTesting(),
        { provide: ErrorHandlerService, useValue: errorHandler },
      ],
    });

    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('não repete um POST quando o servidor responde com erro', () => {
    http.post('/programa/1/edocs/solicitarassinaturas', null).subscribe({
      error: () => {},
    });

    const request = controller.expectOne('/programa/1/edocs/solicitarassinaturas');
    request.flush({ mensagem: 'Falha' }, { status: 500, statusText: 'Erro' });

    controller.expectNone('/programa/1/edocs/solicitarassinaturas');
    expect(errorHandler.handleError).toHaveBeenCalledTimes(1);
  });
});
