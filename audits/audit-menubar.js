const { readWorkbench } = require('./_lib');

const WORKBENCH = readWorkbench();

function has(s, pattern) {
  return s.includes(pattern.replace(/ /g, '')) || s.includes(pattern);
}

const MENU_CHECKS = [
  ['编辑-撤销', '&&撤销'],
  ['编辑-重做', '&&重做'],
  ['编辑-剪切', '剪&&切'],
  ['编辑-复制', '&&复制'],
  ['编辑-粘贴', '&&粘贴'],
  ['编辑-全选', '全&&选'],
  ['查看-更改', 'order:1,title:"更改"'],
  ['查看-文件', 'order:3,title:"文件"'],
  ['查看-终端', 'order:4,title:"终端"'],
  ['查看-放大', 'title:"放大"'],
  ['查看-缩小', 'title:"缩小"'],
  ['查看-重置缩放', 'title:"重置缩放"'],
  ['帮助-命令面板', 'title:"命令面板"'],
  ['帮助-查看许可证', 'title:"查看许可证"'],
  ['菜单栏-文件', 'MenubarFileMenu,label:"文件"'],
  ['菜单栏-编辑', 'MenubarEditMenu,label:"编辑"'],
  ['菜单栏-查看', 'MenubarViewMenu,label:"查看"'],
  ['菜单栏-帮助', 'MenubarHelpMenu,label:"帮助"'],
];

const normalized = WORKBENCH.replace(/label:\s+"/g, 'label:"').replace(/title:\s+"/g, 'title:"');

let pass = 0, fail = 0;
console.log('=== 顶部菜单专项检测 ===\n');
for (const [name, pattern] of MENU_CHECKS) {
  const ok = normalized.includes(pattern);
  console.log(`${ok ? '✅' : '❌'} ${name}`);
  ok ? pass++ : fail++;
}
console.log(`\n结果: ${pass}/${MENU_CHECKS.length} 通过`);
process.exit(fail > 0 ? 1 : 0);
