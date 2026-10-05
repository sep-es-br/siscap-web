import { formatarMensagem, MENSAGENS } from './constants';

describe('Catálogo de mensagens', () => {
  it('substitui parâmetros repetidos e mantém zero', () => {
    expect(formatarMensagem('{nome}: {valor} ({nome})', { nome: 'DIC', valor: 0 }))
      .toBe('DIC: 0 (DIC)');
  });

  it('mantém parâmetros ausentes e ignora propriedades herdadas', () => {
    expect(formatarMensagem('{ausente} {toString}', {})).toBe('{ausente} {toString}');
  });

  it('não interpreta parâmetros contidos no valor fornecido', () => {
    expect(formatarMensagem('{nome}', { nome: '{outro}', outro: 'alterado' }))
      .toBe('{outro}');
  });

  it('trata parâmetros nulos e mantém o catálogo imutável', () => {
    expect(formatarMensagem('{nome}', { nome: null })).toBe('');
    expect(Object.isFrozen(MENSAGENS)).toBeTrue();
  });
});
