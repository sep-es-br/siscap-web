import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { of, Subject, throwError } from 'rxjs';
import { ProgramaFormComponent } from './programa-form.component';
import { ProgramaFormModel } from '../../../core/models/programa.model';
import { StatusPrograma } from '../../../core/interfaces/programa.interface';
import { IProgramaInformacoesDics } from '../../../core/interfaces/programa-informacoes-dics.interface';
import { ProgramasService } from '../../../core/services/programas/programas.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb/breadcrumb.service';
import { EquipeService } from '../../../core/services/equipe/equipe.service';
import { ValorService } from '../../../core/services/valor/valor.service';
import { OpcoesDropdownService } from '../../../core/services/opcoes-dropdown/opcoes-dropdown.service';
import { ToastService } from '../../../core/services/toast/toast.service';
import { NavegacaoService } from '../../../core/services/navegacao/navegacao.service';
import { PessoasService } from '../../../core/services/pessoas/pessoas.service';
import { UsuarioService } from '../../../core/services/usuario/usuario.service';
import { ProjetosService } from '../../../core/services/projetos/projetos.service';

describe('ProgramaFormComponent - informações dos DICs', () => {
  let component: ProgramaFormComponent;
  let programas: jasmine.SpyObj<ProgramasService>;
  const informacoes = (objetivo: string, id = 1): IProgramaInformacoesDics => ({
    dics: [{ id, nome: `DIC ${id}`, objetivo }],
    regioesAtendidas: [{ id, nome: `Região ${id}` }],
  });

  beforeEach(() => {
    programas = jasmine.createSpyObj('ProgramasService', ['buscarInformacoesDics'], { idPrograma$: new Subject<number>() });
    programas.buscarInformacoesDics.and.returnValue(of(informacoes('Objetivo do DIC')));
    TestBed.configureTestingModule({
      providers: [
        ProgramaFormComponent,
        NonNullableFormBuilder,
        { provide: ProgramasService, useValue: programas },
        { provide: BreadcrumbService, useValue: {
          executarAcaoBotao$: new Subject(),
          listaBotaoAcaoPropriedades$: new Subject(),
        } },
        ...[EquipeService, ValorService, OpcoesDropdownService, NgbModal, ToastService,
          NavegacaoService, PessoasService, UsuarioService, ProjetosService]
          .map(provide => ({ provide, useValue: {} })),
      ],
    });
    component = TestBed.inject(ProgramaFormComponent);
    component.programaForm = new FormGroup({
      objetivo: new FormControl('', { nonNullable: true }),
      idProjetoPropostoList: new FormControl([1], { nonNullable: true }),
    });
  });

  afterEach(() => component['informacoesDicsSubscription']?.unsubscribe());

  it('preenche o objetivo e as regiões com os dados dos DICs', () => {
    component['observarInformacoesDics']();

    expect(component.getControl('objetivo').value).toBe('Objetivo do DIC');
    expect(component.regioesAtendidas).toEqual([{ id: 1, nome: 'Região 1' }]);
    expect(component.objetivosDics).toEqual([{ id: 1, nome: 'DIC 1', objetivo: 'Objetivo do DIC' }]);
  });

  it('reúne os objetivos sem repetir textos iguais', () => {
    const dados = informacoes('Objetivo A');
    dados.dics.push({ id: 2, nome: 'DIC 2', objetivo: 'Objetivo B' },
      { id: 3, nome: 'DIC 3', objetivo: ' Objetivo A ' });
    programas.buscarInformacoesDics.and.returnValue(of(dados));

    component['observarInformacoesDics']();

    expect(component.getControl('objetivo').value).toBe('Objetivo A\n\nObjetivo B');
  });

  it('preserva o texto editado ao trocar os DICs e avisa sobre a revisão', () => {
    component['observarInformacoesDics']();
    component.getControl('objetivo').setValue('Resumo revisado pelo usuário');
    component.marcarObjetivoEditado();
    programas.buscarInformacoesDics.and.returnValue(of(informacoes('Outro objetivo', 2)));

    component.idProjetoPropostoList.setValue([2]);

    expect(component.getControl('objetivo').value).toBe('Resumo revisado pelo usuário');
    expect(component.objetivoPrecisaRevisao).toBeTrue();
    expect(component.regioesAtendidas[0].id).toBe(2);
    expect(component.objetivosDics).toEqual([{ id: 2, nome: 'DIC 2', objetivo: 'Outro objetivo' }]);
  });

  it('preserva objetivo e regiões salvos na abertura de Programa assinado', () => {
    component.statusProgramaAtual = StatusPrograma.ASSINADO;
    component.getControl('objetivo').setValue('Texto já salvo');
    const programa = new ProgramaFormModel();
    programa.objetivo = 'Texto já salvo';
    programa.regioesAtendidas = [{ id: 9, nome: 'Região gravada' }];

    component['observarInformacoesDics'](programa);

    expect(component.getControl('objetivo').value).toBe('Texto já salvo');
    expect(component.regioesAtendidas).toEqual(programa.regioesAtendidas);
    expect(component.objetivoPrecisaRevisao).toBeFalse();
  });

  it('ignora a resposta de uma seleção anterior', () => {
    const anterior = new Subject<IProgramaInformacoesDics>();
    programas.buscarInformacoesDics.and.returnValue(anterior);
    component['observarInformacoesDics']();
    programas.buscarInformacoesDics.and.returnValue(of(informacoes('Objetivo atual', 2)));

    component.idProjetoPropostoList.setValue([2]);
    anterior.next(informacoes('Objetivo antigo'));

    expect(component.getControl('objetivo').value).toBe('Objetivo atual');
    expect(component.regioesAtendidas[0].id).toBe(2);
  });

  it('exibe regiões das ações dos DICs em Programa assinado sem regiões salvas', () => {
    component.statusProgramaAtual = StatusPrograma.ASSINADO;
    component.getControl('objetivo').setValue('Objetivo já salvo');
    const programa = new ProgramaFormModel();
    programa.objetivo = 'Objetivo já salvo';
    programa.regioesAtendidas = [];

    component['observarInformacoesDics'](programa);

    expect(component.regioesAtendidas).toEqual([{ id: 1, nome: 'Região 1' }]);
    expect(component.getControl('objetivo').value).toBe('Objetivo já salvo');
    expect(component.isProgramaAtualEditavel).toBeFalse();
  });

  it('preserva regiões de Programa assinado ao tentar novamente após falha', () => {
    component.statusProgramaAtual = StatusPrograma.ASSINADO;
    const programa = new ProgramaFormModel();
    programa.regioesAtendidas = [{ id: 9, nome: 'Região gravada' }];
    programas.buscarInformacoesDics.and.returnValue(throwError(() => new Error('Falha de rede')));
    component['observarInformacoesDics'](programa);
    programas.buscarInformacoesDics.and.returnValue(of(informacoes('Objetivo atual', 2)));

    component.tentarCarregarInformacoesDics();

    expect(component.regioesAtendidas).toEqual(programa.regioesAtendidas);
    expect(component.erroInformacoesDics).toBeFalse();
  });

  it('limpa as regiões ao remover todos os DICs e preserva o objetivo editado', () => {
    component['observarInformacoesDics']();
    component.marcarObjetivoEditado();

    component.idProjetoPropostoList.setValue([]);

    expect(component.regioesAtendidas).toEqual([]);
    expect(component.getControl('objetivo').value).toBe('Objetivo do DIC');
  });

  it('permite tentar novamente depois de falha na consulta', () => {
    programas.buscarInformacoesDics.and.returnValue(throwError(() => new Error('Falha de rede')));
    component['observarInformacoesDics']();
    expect(component.erroInformacoesDics).toBeTrue();
    programas.buscarInformacoesDics.and.returnValue(of(informacoes('Objetivo recuperado')));

    component.tentarCarregarInformacoesDics();

    expect(component.erroInformacoesDics).toBeFalse();
    expect(component.carregandoInformacoesDics).toBeFalse();
    expect(component.getControl('objetivo').value).toBe('Objetivo recuperado');
  });
});
