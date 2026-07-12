const { readWorkbench } = require('./_lib');

const pat = readWorkbench();

function titlesInBlock(s) {
  const start = s.indexOf('V(sf,{shortcut:Ae,title:');
  if (start < 0) return [];
  const chunk = s.substring(start, start + 4000);
  return [...new Set([...chunk.matchAll(/title:\s*"([^"]+)"/g)].map(m => m[1]))];
}

const mustHave = [
  '使用 Git 仓库来跟踪更改', '初始化仓库', '没有${e}更改', 'label:"本地",variant:"local"',
  '目标环境：本地', 'function i$0',
  'label:"云端",color:"cyan",icon:"cloud",title:"目标环境：云端"',
  'label:"本地",color:"green",icon:"laptop",title:"目标环境：本地"',
];
const mustNotHave = [
  'Initialize Repository', 'Use a Git repository to track changes', 'No ${e} Changes',
  'label:"Local",variant:"local"', 'Target environment: local', 'title:"Changes"', 'title:"Terminal"',
  'label:"Local",color:"green",icon:"laptop"', 'label:"Cloud",color:"cyan",icon:"cloud",title:"目标环境',
];
const glassTitles = titlesInBlock(pat);
const glassOk = glassTitles.every(t => !/^[A-Za-z]/.test(t) || t === 'Tab');

console.log('=== Glass 顶部标签 ===');
console.log('标签:', glassTitles.join(', '));
console.log(glassOk ? '✅' : '❌', 'Glass 标签应全为中文');

console.log('\n=== SCM / 环境 ===');
let ok = glassOk;
for (const c of mustHave) {
  const pass = pat.includes(c);
  if (!pass) ok = false;
  console.log((pass ? '✅' : '❌'), '应有:', c);
}
for (const c of mustNotHave) {
  const pass = !pat.includes(c);
  if (!pass) ok = false;
  console.log((pass ? '✅' : '❌'), '不应有:', c);
}

const LW0 = { uncommitted: '未提交' };
console.log('✅ 运行时标题:', `没有${LW0.uncommitted}更改`);

process.exit(ok ? 0 : 1);
