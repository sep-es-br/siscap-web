const { test } = require('node:test');
const assert = require('node:assert/strict');
const { resolveVersion } = require('./generate-version.cjs');

test('preserva a versão completa fornecida pela pipeline', () => {
  assert.equal(resolveVersion({ APP_VERSION: ' 1.47.r.26.1023.1520 ', BUILD_NUMBER: '42' }), '1.47.r.26.1023.1520');
});

test('identifica o build quando não existe versão completa', () => {
  assert.equal(resolveVersion({ BUILD_NUMBER: '42' }), 'build.42');
});

test('identifica execução local sem inventar uma versão de release', () => {
  assert.equal(resolveVersion({}), 'Desenvolvimento');
  assert.equal(resolveVersion({ APP_VERSION: ' ', BUILD_NUMBER: ' ' }), 'Desenvolvimento');
});
