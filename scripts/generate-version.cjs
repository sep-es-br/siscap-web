const { mkdirSync, readFileSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');

function resolveVersion(configuredVersion = '') {
  const configured = configuredVersion.trim();
  return configured && !configured.includes('@release#@') && !configured.startsWith('build.')
    ? configured
    : 'Desenvolvimento';
}

if (require.main === module) {
  const environmentPath = join(__dirname, '..', 'src', 'environments', 'environment.ts');
  const source = readFileSync(environmentPath, 'utf8');
  const versionField = /\bversion\s*:\s*(['"])(.*?)\1/;
  const configuredVersion = source.match(versionField)?.[2];
  const version = resolveVersion(configuredVersion);
  if (!versionField.test(source)) throw new Error('environment.version não encontrado');
  const assets = join(__dirname, '..', 'src', 'assets');
  mkdirSync(assets, { recursive: true });
  writeFileSync(join(assets, 'version.json'), `${JSON.stringify({ version }, null, 2)}\n`);
}

module.exports = { resolveVersion };
