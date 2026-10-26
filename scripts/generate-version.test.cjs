const { test } = require('node:test');
const assert = require('node:assert/strict');
const { resolveVersion } = require('./generate-version.cjs');

test('preserva a versão substituída no environment pelo pipeline', () => {
  assert.equal(resolveVersion(' 1.47.r.26.1023.1520 '), '1.47.r.26.1023.1520');
});

test('usa desenvolvimento enquanto o marcador não foi substituído', () => {
  assert.equal(resolveVersion('@release#@'), 'Desenvolvimento');
  assert.equal(resolveVersion('1.0.@release#@'), 'Desenvolvimento');
  assert.equal(resolveVersion(), 'Desenvolvimento');
  assert.equal(resolveVersion(' '), 'Desenvolvimento');
});

test('não apresenta o contador antigo como versão', () => {
  assert.equal(resolveVersion('build.379'), 'Desenvolvimento');
});
