import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { EMPTY, of, Subject } from 'rxjs';
import { ProjetoFormComponent } from './projeto-form.component';
import { TipoPapelEnum } from '../../../core/enums/tipo-papel.enum';
import { TipoStatusEnum } from '../../../core/enums/tipo-status.enum';
import { AcoesService } from '../../../core/services/acoes/acoes.service';
import { RateioService } from '../../../core/services/rateio/rateio.service';
import { ProjetoAcoesRateioComponent } from '../projeto-acoes-rateio/projeto-acoes-rateio.component';

describe('Rascunho de um novo DIC', () => {
  let component: ProjetoFormComponent;
  let post: jasmine.Spy;
  let acoesService: AcoesService;

  beforeEach(() => {
    post = jasmine.createSpy('post').and.returnValue(EMPTY);
    acoesService = new AcoesService(new FormBuilder().nonNullable, {
      construirRateioFormArray: () => new FormArray<FormGroup>([])
    } as unknown as RateioService);
    const opcoes = {
      getOpcoesOrganizacoes: () => of([]), getOpcoesPlanos: () => of([]),
      getOpcoesTiposValor: () => of([]), getOpcoesLocalidades: () => of([]),
      getOpcoesTiposPapel: () => of([]), getOpcoesTiposArquivamento: () => of([])
    };
    component = new ProjetoFormComponent(
      new FormBuilder().nonNullable, {} as any, { post } as any, opcoes as any,
      {} as any, { construirEquipeFormArray: () => new FormArray<FormGroup>([]) } as any,
      { construirValorFormGroup: () => new FormBuilder().group({ tipo: 1, moeda: 'BRL', quantia: null }) } as any,
      { construirRateioFormArray: () => new FormArray<FormGroup>([]) } as any,
      {} as any, {} as any,
      { executarAcaoBotao$: EMPTY, listaBotaoAcaoPropriedades$: new Subject() } as any, {} as any,
      {
        construirindicadoresFormArray: () => new FormArray<FormGroup>([]),
        construirindicadoresAvulsosFormArray: () => new FormArray<FormGroup>([])
      } as any,
      acoesService,
      {} as any, {} as any, {} as any, {} as any, {} as any, {} as any
    );
    spyOn<any>(component, 'configurarValidacaoSigla');
    spyOn<any>(component, 'carregarPessoasPorOrganizacao').and.returnValue(of([]));
    (component as any).iniciarForm();
    component.projetoForm.patchValue({
      sigla: 'TESTE', titulo: 'Novo DIC', idOrganizacao: 1, idResponsavelProponente: 2
    });
    (component.projetoForm.get('equipeElaboracao') as FormArray).push(
      new FormBuilder().group({
        idPessoa: 3, idPapel: TipoPapelEnum.Membro_do_Projeto, idStatus: TipoStatusEnum.Ativo
      })
    );
  });

  afterEach(() => component.ngOnDestroy());

  it('não envia a linha vazia criada automaticamente pela aba Ações', () => {
    const abaAcoes = new ProjetoAcoesRateioComponent(acoesService, {} as RateioService);
    abaAcoes.formProjeto = component.projetoForm;
    abaAcoes.isModoEdicao = true;
    try {
      abaAcoes.ngOnChanges();
      expect(abaAcoes.acoesProjeto.length).toBe(1);
      (component as any).salvarRascunho();
      expect(post).toHaveBeenCalledTimes(1);
      expect(post.calls.mostRecent().args[0].acoesRateioProjeto).toEqual([]);
      expect(abaAcoes.acoesProjeto.length).toBe(1);
    } finally {
      abaAcoes.ngOnDestroy();
    }
  });

  it('preserva as ações preenchidas e as já gravadas, omitindo apenas linhas novas vazias', () => {
    const acoes = component.projetoForm.get('acoesRateioProjeto') as FormArray;
    for (const dados of [
      {}, { descricaoAcaoPrincipal: 'Construir escola' },
      { descricaoAcaoSecundaria: 'Etapa 1' }, { valorEstimadoAcaoPrincipal: 100 },
      { idAcao: 10 }
    ]) {
      acoes.push(acoesService.construirAcaoFormGroup(dados as any));
    }
    (component as any).salvarRascunho();
    const enviadas = post.calls.mostRecent().args[0].acoesRateioProjeto;
    expect(enviadas.length).toBe(4);
    expect(enviadas[0].descricaoAcaoPrincipal).toBe('Construir escola');
    expect(enviadas[3].idAcao).toBe(10);
  });

  it('salva sem ações, indicadores, ODS e planejamento, com apenas os dados mínimos', () => {
    expect(component.projetoForm.invalid).toBeTrue();
    (component as any).salvarRascunho();
    expect(post).toHaveBeenCalledTimes(1);
    const [payload, rascunho] = post.calls.mostRecent().args;
    expect(rascunho).toBeTrue();
    expect(payload.acoesPlanejamentoProjeto).toEqual([]);
    expect(payload.acoesRateioProjeto).toEqual([]);
    expect(payload.indicadoresProjeto).toEqual([]);
    expect(payload.odsProjeto).toEqual([]);
    expect(payload.objetivo).toBe('');
  });

  it('não trata o rascunho como envio após uma intenção anterior de enviar', () => {
    component.projetoForm.patchValue({ enviarProjetoGestor: true });
    (component as any).salvarRascunho();
    expect(post).toHaveBeenCalledTimes(1);
    expect(post.calls.mostRecent().args[0].enviarProjetoGestor).toBeFalse();
  });

  for (const campo of ['sigla', 'titulo', 'idOrganizacao', 'idResponsavelProponente']) {
    it(`exige ${campo} no rascunho`, () => {
      component.projetoForm.get(campo)!.setValue(null);
      spyOn<any>(component, 'abrirModalPendencias');
      (component as any).salvarRascunho();
      expect(post).not.toHaveBeenCalled();
      expect((component as any).abrirModalPendencias).toHaveBeenCalled();
    });
  }

  it('exige um membro ativo além do redator', () => {
    (component.projetoForm.get('equipeElaboracao') as FormArray).at(0)
      .patchValue({ idPapel: TipoPapelEnum.Redator });
    spyOn<any>(component, 'abrirModalPendencias');
    (component as any).salvarRascunho();
    expect(post).not.toHaveBeenCalled();
  });

  it('mantém o envio bloqueado quando os campos das demais abas estão vazios', () => {
    spyOn<any>(component, 'abrirModalPendencias');
    (component as any).salvarEEnviar();
    expect(post).not.toHaveBeenCalled();
    expect((component as any).abrirModalPendencias).toHaveBeenCalled();
  });

  it('também envia o salvamento automático sem intenção de envio', () => {
    const payload = (component as any).montarPayloadProjeto();
    payload.enviarProjetoGestor = true;
    (component as any).salvarRascunhoAutomaticamente(payload).subscribe();
    expect(post).toHaveBeenCalledWith(jasmine.objectContaining({
      enviarProjetoGestor: false, acoesRateioProjeto: [], acoesPlanejamentoProjeto: []
    }), true);
  });
});
