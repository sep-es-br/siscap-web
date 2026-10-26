import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { AcoesService } from '../../../core/services/acoes/acoes.service';
import { RateioService } from '../../../core/services/rateio/rateio.service';
import { ProjetoAcoesRateioComponent } from './projeto-acoes-rateio.component';

describe('Campos iniciais da aba Acoes', () => {
  function preparar(editavel = true) {
    const construir = () => new FormGroup({
      descricaoAcaoPrincipal: new FormControl(''),
      valorEstimadoAcaoPrincipal: new FormControl(0),
      rateio: new FormArray([])
    });
    const component = new ProjetoAcoesRateioComponent(
      { construirAcaoFormGroup: construir } as unknown as AcoesService,
      {} as RateioService
    );
    const acoes = new FormArray([construir()]);
    acoes.clear();
    component.formProjeto = new FormGroup({ acoesRateioProjeto: acoes });
    component.isModoEdicao = editavel;
    return { component, acoes };
  }

  it('prepara uma unica acao para mostrar os campos sem clicar em adicionar', () => {
    const { component, acoes } = preparar();
    component.ngOnChanges();
    component.ngOnChanges();
    expect(acoes.length).toBe(1);
    expect(acoes.pristine).toBeTrue();
  });

  it('preserva os dados existentes', () => {
    const { component, acoes } = preparar();
    component.adicionarAcao();
    acoes.at(0).controls.descricaoAcaoPrincipal.setValue('Acao existente');
    component.ngOnChanges();
    expect(acoes.length).toBe(1);
    expect(acoes.at(0).value.descricaoAcaoPrincipal).toBe('Acao existente');
  });

  it('mantem os campos disponiveis depois de excluir a ultima acao', () => {
    const { component, acoes } = preparar();
    component.ngOnChanges();
    component.removerAcao(0);
    expect(acoes.length).toBe(1);
    expect(acoes.at(0).value.descricaoAcaoPrincipal).toBe('');
    expect(component.acaoAtivaIndex).toBe(0);
  });

  it('nao cria dados no modo de consulta', () => {
    const { component, acoes } = preparar(false);
    component.ngOnChanges();
    expect(acoes.length).toBe(0);
  });

  it('traz a acao ativa para a faixa visivel e atualiza as setas', async () => {
    const { component } = preparar();
    const area = document.createElement('div');
    area.style.cssText = 'display:flex;width:200px;overflow:auto;';
    for (let i = 0; i < 24; i++) {
      const tab = document.createElement('div');
      tab.style.cssText = 'flex:0 0 100px;height:36px;';
      tab.className = 'acao-tab-group' + (i === 23 ? ' active' : '');
      area.appendChild(tab);
    }
    document.body.appendChild(area);
    Object.defineProperty(component, 'acoesScroller', { value: { nativeElement: area } });
    try {
      component.ngAfterViewInit();
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
      expect(area.scrollLeft).toBeGreaterThan(0);
      expect(component.podeRolarEsquerda).toBeTrue();
      expect(component.podeRolarDireita).toBeFalse();
      const ativa = area.querySelector('.active')!.getBoundingClientRect();
      expect(ativa.right).toBeLessThanOrEqual(area.getBoundingClientRect().right + 1);
    } finally {
      component.ngOnDestroy();
      area.remove();
    }
  });
});
