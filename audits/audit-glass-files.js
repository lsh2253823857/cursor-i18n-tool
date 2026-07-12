const { readWorkbench } = require('./_lib');

const p = readWorkbench();

const mustHave = [
  '未打开工作区文件夹',
  '正在加载工作区…',
  'wK0="打开文件以开始"',
  'F("glass.fileTab.emptyState.openFile","打开文件")',
  'F("glass.fileTab.emptyState.newFile","新建文件")',
  'F("glassFileTreeCreateFileLabel","新建文件")',
  'F("glassFileTreeCreateFolderLabel","新建文件夹")',
];
const mustNotHave = [
  'No workspace folder open',
  'Open a file to get started',
  'Select a file to view',
  'F("glass.fileTab.emptyState.openFile","Open File")',
  'F("glass.fileTab.emptyState.newFile","New File")',
  'children:"Loading workspace\\u2026"',
];

console.log('=== Glass 文件页 ===');
let ok = true;
for (const c of mustHave) {
  const pass = p.includes(c);
  if (!pass) ok = false;
  console.log((pass ? '✅' : '❌'), '应有:', c);
}
for (const c of mustNotHave) {
  const pass = !p.includes(c);
  if (!pass) ok = false;
  console.log((pass ? '✅' : '❌'), '不应有:', c);
}
process.exit(ok ? 0 : 1);
