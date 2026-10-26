const { mkdirSync, readFileSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');

function resolveVersion(env, configuredVersion = '') {
  const release = env.APP_VERSION?.trim();
  if (release) return release;
  const configured = configuredVersion.trim();
  if (configured && !['Desenvolvimento', 'Não disponível'].includes(configured) && !configured.startsWith('build.')) return configured;
  const build = env.BUILD_NUMBER?.trim();
  return build ? 'Não disponível' : 'Desenvolvimento';
}

if (require.main === module) {
  const environmentPath = join(__dirname, '..', 'src', 'environments', 'environment.ts');
  const source = readFileSync(environmentPath, 'utf8');
  const versionField = /\bversion\s*:\s*(['"])(.*?)\1/;
  const configuredVersion = source.match(versionField)?.[2];
  const version = resolveVersion(process.env, configuredVersion);
  if (!versionField.test(source)) throw new Error('environment.version não encontrado');
  writeFileSync(environmentPath, source.replace(versionField, () => `version: ${JSON.stringify(version)}`));
  const assets = join(__dirname, '..', 'src', 'assets');
  mkdirSync(assets, { recursive: true });
  writeFileSync(join(assets, 'version.json'), `${JSON.stringify({ version }, null, 2)}\n`);
}

module.exports = { resolveVersion };
