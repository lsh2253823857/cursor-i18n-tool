const { readNls } = require('./_lib');

const nls = readNls();
const checks = [
  [4808, '新建智能体窗口'],
  [4809, '切换到 {0}'],
  [13472, '关闭窗口'],
  [13479, '退&&出'],
  [13460, '关&&闭窗口'],
];
console.log('=== File 菜单 nls 索引 ===');
let ok = true;
for (const [idx, want] of checks) {
  const pass = nls[idx] === want;
  if (!pass) ok = false;
  console.log((pass ? '✅' : '❌'), idx, '=>', nls[idx], pass ? '' : `(期望: ${want})`);
}
process.exit(ok ? 0 : 1);
