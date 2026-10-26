const { mkdirSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');

function resolveVersion(env) {
  const release = env.APP_VERSION?.trim();
  if (release) return release;
  const build = env.BUILD_NUMBER?.trim();
  return build ? `build.${build}` : 'Desenvolvimento';
}

if (require.main === module) {
  const assets = join(__dirname, '..', 'src', 'assets');
  mkdirSync(assets, { recursive: true });
  writeFileSync(join(assets, 'version.json'), `${JSON.stringify({ version: resolveVersion(process.env) }, null, 2)}\n`);
}

module.exports = { resolveVersion };
