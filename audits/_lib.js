const { getCursorPaths } = require('../paths');

function readWorkbench() {
  const { mainJsPath } = getCursorPaths();
  return require('fs').readFileSync(mainJsPath, 'utf8');
}

function readNls() {
  const { nlsPath } = getCursorPaths();
  return JSON.parse(require('fs').readFileSync(nlsPath, 'utf8'));
}

module.exports = { readWorkbench, readNls, getCursorPaths };
