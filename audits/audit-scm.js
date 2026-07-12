const { readWorkbench } = require('./_lib');

const s = readWorkbench();

const mustHave = [
  '使用 Git 仓库来跟踪更改',
  '初始化仓库',
  'LW0={uncommitted:"未提交"',
  '本地更改',
  '云端更改',
  '没有已提交的更改',
  'label:"本地",variant:"local"',
  'label:"云端",variant:"cloud"',
  '没有未暂存的更改',
  '本地分支上没有未提交的更改',
];

const mustNotHave = [
  'Initialize Repository',
  'Use a Git repository to track changes',
  'No ${e} Changes',
  'Local Changes',
  'label:"Local",variant:"local"',
  'No unstaged changes',
  'No uncommitted changes on your local branch',
  'No committed changes against ${e}',
];

console.log('=== Git/SCM 验证 ===');
let ok = true;
for (const c of mustHave) {
  const pass = s.includes(c);
  if (!pass) ok = false;
  console.log((pass ? '✅' : '❌'), '应有:', c);
}
for (const c of mustNotHave) {
  const pass = !s.includes(c);
  if (!pass) ok = false;
  console.log((pass ? '✅' : '❌'), '不应有:', c);
}

const LW0 = { uncommitted: '未提交' };
console.log('✅ 运行时标题:', `没有${LW0.uncommitted}更改`);

process.exit(ok ? 0 : 1);
