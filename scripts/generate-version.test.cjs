const { test } = require('node:test');
const assert = require('node:assert/strict');
const { resolveVersion } = require('./generate-version.cjs');

test('preserva a versão completa fornecida pela pipeline', () => {
  assert.equal(resolveVersion({ APP_VERSION: ' 1.47.r.26.1023.1520 ', BUILD_NUMBER: '42' }), '1.47.r.26.1023.1520');
});

test('não apresenta o contador do Jenkins como versão completa', () => {
  assert.equal(resolveVersion({ BUILD_NUMBER: '42' }), 'Não disponível');
});

test('preserva a versão inserida pelo Jenkins no environment como no OpenPMO', () => {
  assert.equal(resolveVersion({ BUILD_NUMBER: '379' }, '1.47.r.26.1023.1520'), '1.47.r.26.1023.1520');
  assert.equal(resolveVersion({ APP_VERSION: '2.0.0' }, '1.0.0'), '2.0.0');
  assert.equal(resolveVersion({ BUILD_NUMBER: '379' }, 'Desenvolvimento'), 'Não disponível');
  assert.equal(resolveVersion({ BUILD_NUMBER: '380' }, 'build.379'), 'Não disponível');
});

test('identifica execução local sem inventar uma versão de release', () => {
  assert.equal(resolveVersion({}), 'Desenvolvimento');
  assert.equal(resolveVersion({ APP_VERSION: ' ', BUILD_NUMBER: ' ' }), 'Desenvolvimento');
});
