const fs = require('fs');
const os = require('os');
const path = require('path');

function resolveCursorAppPath() {
  if (process.env.CURSOR_APP_PATH) {
    return process.env.CURSOR_APP_PATH;
  }

  const configPath = path.join(__dirname, 'config.json');
  if (fs.existsSync(configPath)) {
    const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (cfg.cursorAppPath) return cfg.cursorAppPath;
  }

  const candidates = [];
  if (process.platform === 'win32') {
    const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
    const programFiles = process.env.ProgramFiles || 'C:\\Program Files';
    candidates.push(
      path.join(localAppData, 'Programs', 'cursor', 'resources', 'app'),
      path.join(programFiles, 'cursor', 'resources', 'app'),
      'E:/cursor/resources/app',
    );
  } else if (process.platform === 'darwin') {
    candidates.push(
      '/Applications/Cursor.app/Contents/Resources/app',
      path.join(os.homedir(), 'Applications', 'Cursor.app', 'Contents', 'Resources/app'),
    );
  }

  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) return candidate;
  }

  throw new Error(
    '未找到 Cursor 安装目录。请复制 config.example.json 为 config.json 并填写 cursorAppPath，或设置环境变量 CURSOR_APP_PATH。',
  );
}

function getCursorPaths() {
  const appPath = resolveCursorAppPath();
  return {
    appPath,
    mainJsPath: path.join(appPath, 'out/vs/workbench/workbench.desktop.main.js'),
    htmlPath: path.join(appPath, 'out/vs/code/electron-sandbox/workbench/workbench.html'),
    productJsonPath: path.join(appPath, 'product.json'),
    nlsPath: path.join(appPath, 'out/nls.messages.json'),
  };
}

module.exports = { resolveCursorAppPath, getCursorPaths };
