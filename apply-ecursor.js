const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { translate } = require('./i18n-core');
const { getCursorPaths } = require('./paths');

const paths = getCursorPaths();
console.log('📂 Cursor 安装路径:', paths.appPath);

function detectHashAlgo(hash) {
  const len = hash.length;
  if (len <= 24) return 'md5';
  if (len <= 44) return 'sha256';
  if (len <= 88) return 'sha512';
  return 'sha256';
}

function fixAllProductChecksums(productJsonPath, appPath) {
  const productJson = JSON.parse(fs.readFileSync(productJsonPath, 'utf8'));
  if (!productJson.checksums) return false;

  let hashUpdated = false;
  for (const key in productJson.checksums) {
    const filePath = path.join(appPath, 'out', key);
    if (!fs.existsSync(filePath)) continue;

    const content = fs.readFileSync(filePath);
    const oldHash = productJson.checksums[key];
    const algo = detectHashAlgo(oldHash);
    const newHash = crypto.createHash(algo)
      .update(content)
      .digest('base64')
      .replace(/=+$/, '');

    if (newHash !== oldHash) {
      productJson.checksums[key] = newHash;
      hashUpdated = true;
      console.log(`  ✅ 已同步校验值: ${key}`);
    }
  }

  if (hashUpdated) {
    fs.writeFileSync(productJsonPath, JSON.stringify(productJson, null, '\t'), 'utf8');
  }
  return hashUpdated;
}

function patchNlsMessages(appPath) {
  const nlsPath = path.join(appPath, 'out/nls.messages.json');
  if (!fs.existsSync(nlsPath)) return false;

  const backupPath = nlsPath + '.backup';
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(nlsPath, backupPath);
  }

  let changed = false;

  // 按索引修补菜单栏等 nls 文案（F(n,null) / cn(n) 实际读取此处）
  try {
    const arr = JSON.parse(fs.readFileSync(nlsPath, 'utf8'));
    const indexPatches = {
      4808: '新建智能体窗口',
      4809: '切换到 {0}',
      13460: '关&&闭窗口',
      13472: '关闭窗口',
      13479: '退&&出',
    };
    for (const [idx, zh] of Object.entries(indexPatches)) {
      const i = Number(idx);
      if (arr[i] !== zh) {
        arr[i] = zh;
        changed = true;
      }
    }
    if (changed) {
      fs.writeFileSync(nlsPath, JSON.stringify(arr), 'utf8');
    }
  } catch (e) {
    console.warn('⚠️  nls.messages.json 索引补丁失败:', e.message);
  }

  let content = fs.readFileSync(nlsPath, 'utf8');
  const replacements = [
    ['Your {0} installation appears to be corrupt. Please reinstall.', '您的 {0} 安装似乎已损坏。请重新安装。'],
    ["Don't Show Again", '不再显示'],
    ['More Information', '更多信息'],
  ];

  let updated = content;
  for (const [from, to] of replacements) {
    updated = updated.split(from).join(to);
  }
  if (updated !== content) {
    fs.writeFileSync(nlsPath, updated, 'utf8');
    changed = true;
  }

  return changed;
}

function patchSidebarNavMap(content) {
  const replacements = [
    ['general:"General"', 'general:"通用"'],
    ['appearance:"Appearance"', 'appearance:"外观"'],
    ['chat:"Agents"', 'chat:"智能体"'],
    ['tab:"Tab"', 'tab:"Tab 补全"'],
    ['models:"Models"', 'models:"模型"'],
    ['hooks:"Hooks"', 'hooks:"钩子"'],
    ['beta:"Beta"', 'beta:"测试版"'],
    ['network:"Network"', 'network:"网络"'],
    ['worktrees:"Worktrees"', 'worktrees:"工作树"'],
    ['"vscode-settings":"VS Code Settings"', '"vscode-settings":"VS Code 设置"'],
    ['"local-automations":"Automations"', '"local-automations":"自动化"'],
    ['?n.isGlass?"Indexing":"Indexing & Docs"', '?n.isGlass?"索引":"索引与文档"'],
    ['n.isGlass?"Indexing":"索引与文档"', 'n.isGlass?"索引":"索引与文档"'],
    ['BLm={marketplace:"Marketplace",docs:"Docs",contact:"Contact"}', 'BLm={marketplace:"插件市场",docs:"官方文档",contact:"联系我们"}'],
    ['title:e?"Indexing":"索引与文档"', 'title:e?"索引":"索引与文档"'],
    ['{menuId:Zt.MenubarFileMenu,label:"File",trigger:"text"}', '{menuId:Zt.MenubarFileMenu,label:"文件",trigger:"text"}'],
    ['{menuId:Zt.MenubarEditMenu,label:"Edit",trigger:"text"}', '{menuId:Zt.MenubarEditMenu,label:"编辑",trigger:"text"}'],
    ['{menuId:Zt.MenubarViewMenu,label:"View",trigger:"text"}', '{menuId:Zt.MenubarViewMenu,label:"查看",trigger:"text"}'],
    ['{menuId:Zt.MenubarHelpMenu,label:"Help",trigger:"text"}', '{menuId:Zt.MenubarHelpMenu,label:"帮助",trigger:"text"}'],
    ['subtitle:"Customize your Cursor experience"', 'subtitle:"自定义你的 Cursor 体验"'],

    // Edit 菜单 - Glass OS 内层 F() 显示文案（用户实际看到的）
    ['"]},"&&Undo")', '"]},"&&撤销")'],
    ['"]},"&&Redo")', '"]},"&&重做")'],
    ['"]},"Cu&&t")', '"]},"剪&&切")'],
    ['"]},"&&Copy")', '"]},"&&复制")'],
    ['"]},"&&Paste")', '"]},"&&粘贴")'],
    ['"]},"Select &&All")', '"]},"全&&选")'],

    // Edit 菜单 - Lexical / 上下文菜单构造函数
    ['new Jl("undo","Undo"', 'new Jl("undo","撤销"'],
    ['new Jl("redo","Redo"', 'new Jl("redo","重做"'],
    ['new Jl("cut","Cut"', 'new Jl("cut","剪切"'],
    ['new Jl("copy","Copy"', 'new Jl("copy","复制"'],
    ['new Jl("paste","Paste"', 'new Jl("paste","粘贴"'],
    ['new Jl("selectAll","Select All"', 'new Jl("selectAll","全选"'],

    // View 底部标签导航映射
    ['{id:"changes",label:"Changes"', '{id:"changes",label:"更改"'],
    ['{id:"terminal",label:"Terminal"', '{id:"terminal",label:"终端"'],

    // Glass Edit 外层 title（au 注册）
    ['au({id:z2_,title:"Undo"', 'au({id:z2_,title:"撤销"'],
    ['au({id:j2_,title:"Redo"', 'au({id:j2_,title:"重做"'],
    ['au({id:V2_,title:"Cut"', 'au({id:V2_,title:"剪切"'],
    ['au({id:K2_,title:"Copy"', 'au({id:K2_,title:"复制"'],
    ['au({id:Y2_,title:"Paste"', 'au({id:Y2_,title:"粘贴"'],
    ['au({id:Q2_,title:"Select All"', 'au({id:Q2_,title:"全选"'],

    // Glass View 菜单（MenubarViewMenu 注册）
    ['group:"1_open",order:1,title:"Changes"', 'group:"1_open",order:1,title:"更改"'],
    ['group:"1_open",order:3,title:"Files"', 'group:"1_open",order:3,title:"文件"'],
    ['group:"1_open",order:4,title:"Terminal"', 'group:"1_open",order:4,title:"终端"'],

    // Glass 顶部菜单 command 注册（title 字段）
    ['au({id:"zoomIn",title:"Zoom In"', 'au({id:"zoomIn",title:"放大"'],
    ['au({id:"zoomOut",title:"Zoom Out"', 'au({id:"zoomOut",title:"缩小"'],
    ['au({id:"zoomReset",title:"Reset Zoom"', 'au({id:"zoomReset",title:"重置缩放"'],
    ['au({id:BPf,title:"Command Palette"', 'au({id:BPf,title:"命令面板"'],
    ['au({id:fLf,title:"View License"', 'au({id:fLf,title:"查看许可证"'],
    ['au({id:"about",title:"About"', 'au({id:"about",title:"关于"'],

    // Menubar 子项 title 字段（Glass menu 注册）
    ['group:"1_do",order:1,title:"Undo"', 'group:"1_do",order:1,title:"撤销"'],
    ['group:"1_do",order:2,title:"Redo"', 'group:"1_do",order:2,title:"重做"'],
    ['group:"3_edit",order:1,title:"Cut"', 'group:"3_edit",order:1,title:"剪切"'],
    ['group:"3_edit",order:2,title:"Copy"', 'group:"3_edit",order:2,title:"复制"'],
    ['group:"3_edit",order:3,title:"Paste"', 'group:"3_edit",order:3,title:"粘贴"'],
    ['group:"3_edit",order:4,title:"Select All"', 'group:"3_edit",order:4,title:"全选"'],
    ['group:"5_zoom",order:1,title:"Zoom In"', 'group:"5_zoom",order:1,title:"放大"'],
    ['group:"5_zoom",order:2,title:"Zoom Out"', 'group:"5_zoom",order:2,title:"缩小"'],
    ['group:"5_zoom",order:3,title:"Reset Zoom"', 'group:"5_zoom",order:3,title:"重置缩放"'],
    ['group:"1_welcome",order:2,title:"Command Palette"', 'group:"1_welcome",order:2,title:"命令面板"'],
    ['group:"4_legal",order:1,title:"View License"', 'group:"4_legal",order:1,title:"查看许可证"'],

    // 上下文菜单 F() nls 兜底文案
    ['F("cut","Cut")', 'F("cut","剪切")'],
    ['F("copy","Copy")', 'F("copy","复制")'],
    ['F("paste","Paste")', 'F("paste","粘贴")'],
    ['F("glassArchiveUndo","Undo")', 'F("glassArchiveUndo","撤销")'],
    ['title:{value:"Terminal",original:"Terminal"', 'title:{value:"终端",original:"终端"'],

    // 通用设置页 - HTML 模板内文案
    ['>Window Layout</p>', '>窗口布局</p>'],
    ['>Switch between Agent and Editor default layouts</div>', '>在智能体与编辑器默认布局之间切换</div>'],
    ['aria-label="Window Layout"', 'aria-label="窗口布局"'],
    ['layout-picker-segmented__label>Agent</span>', 'layout-picker-segmented__label>智能体</span>'],
    ['layout-picker-segmented__label>Editor</span>', 'layout-picker-segmented__label>编辑器</span>'],
    ['{id:"agent",label:"Agent"}', '{id:"agent",label:"智能体"}'],
    ['{id:"editor",label:"Editor"}', '{id:"editor",label:"编辑器"}'],

    // File 菜单 — workbench 兜底 + nls 索引（见 patchNlsMessages）
    ['cn(4808,"New Agents Window")', 'cn(4808,"新建智能体窗口")'],
    ['"New Agents Window (Glass)"', '"新建智能体窗口 (Glass)"'],
    ['group:"9_exit",order:0,title:"Exit"', 'group:"9_exit",order:0,title:"退出"'],
    ['"aria-label":"Close Window"', '"aria-label":"关闭窗口"'],
    // Zsm 仅用于 cn(4809,"Switch to {0}",Zsm) 的 {0} 显示名；nls 4809 负责「切换到 {0}」
    ['children:"Open Agents Window"', 'children:"打开智能体窗口"'],
    ['title:"Meet the new Agents Window"', 'title:"了解全新智能体窗口"'],
    ['ariaLabel:"Meet the new Agents Window"', 'ariaLabel:"了解全新智能体窗口"'],
    ['metadata:{description:"Switch to Agents Window (Glass)"}', 'metadata:{description:"切换到智能体窗口 (Glass)"}'],
    ['metadata:{description:"Open or Focus Agents Window (Glass)"}', 'metadata:{description:"打开或聚焦智能体窗口 (Glass)"}'],
    ['title:"Developer: New Additional Agents Window"', 'title:"开发者：新建额外智能体窗口"'],

    // 对话密度 / 审查控件下拉项
    ['{id:"breadcrumb",label:"Breadcrumb"}', '{id:"breadcrumb",label:"面包屑"}'],
    ['{id:"island",label:"Island"}', '{id:"island",label:"浮动岛"}'],
    ['{id:Ver,label:"Compact"}', '{id:Ver,label:"精简"}'],
    ['{id:Wts,label:"Balanced"}', '{id:Wts,label:"平衡"}'],
    ['{id:M9n,label:"Detailed"}', '{id:M9n,label:"详细"}'],

    // 源代码管理 / Git 面板
    ['LW0={uncommitted:"Uncommitted",unstaged:"Unstaged",staged:"Staged",branch:"Branch"}',
     'LW0={uncommitted:"未提交",unstaged:"未暂存",staged:"已暂存",branch:"分支"}'],
    ['return t===0?n.scope==="branch"&&!n.isAllCommitsSelection?"No committed changes":`No ${e} Changes`:`${t} ${e} ${t===1?"Change":"Changes"}`}',
     'return t===0?n.scope==="branch"&&!n.isAllCommitsSelection?"没有已提交的更改":`没有${e}更改`:`${t} 处${e}更改`}'],
    ['return t===0?n.scope==="branch"&&!n.isAllCommitsSelection?"没有已提交的更改":`No ${e} Changes`:`${t} ${e} ${t===1?"Change":"Changes"}`}',
     'return t===0?n.scope==="branch"&&!n.isAllCommitsSelection?"没有已提交的更改":`没有${e}更改`:`${t} 处${e}更改`}'],
    ['return n==="branch"?"All Branch Changes":LW0[n]', 'return n==="branch"?"全部分支更改":LW0[n]'],
    ['message:"Use a Git repository to track changes"', 'message:"使用 Git 仓库来跟踪更改"'],
    ['children:"Initialize Repository"', 'children:"初始化仓库"'],
    ['FR=Le?"Cloud Changes":"Local Changes"', 'FR=Le?"云端更改":"本地更改"'],
    ['`PR #${rS}`:"PR Changes"', '`PR #${rS}`:"PR 更改"'],
    ['title:"Uncommitted Changes"', 'title:"未提交的更改"'],
    ['label:"Move to Local"', 'label:"移至本地"'],
    ['"Failed to initialize repository"', '"初始化仓库失败"'],
    ['vi.allCollapsed?"Expand All":"Collapse All"', 'vi.allCollapsed?"全部展开":"全部折叠"'],
    ['rP?"Expand All":"Collapse All"', 'rP?"全部展开":"全部折叠"'],

    // SCM 环境标签（Local / Cloud 徽章）
    ['{icon:"cloud",label:"Cloud",variant:"cloud"}:e.type==="remote-ssh"||e.type==="remote-wsl"?{icon:"server",label:"Local",variant:"local"}:{icon:"laptop",label:"Local",variant:"local"}',
     '{icon:"cloud",label:"云端",variant:"cloud"}:e.type==="remote-ssh"||e.type==="remote-wsl"?{icon:"server",label:"本地",variant:"local"}:{icon:"laptop",label:"本地",variant:"local"}'],

    // SCM 空状态文案（aTE 函数）
    ['function aTE(n,e,t){switch(n){case"uncommitted":return t.isCloudAgent?t.hasRemoteBranchOrPr?"All changes have been pushed to the remote branch":"No changes on this cloud agent\'s branch yet":"No uncommitted changes on your local branch";case"unstaged":return"No unstaged changes";case"staged":return"No staged changes";case"branch":return t.isAllCommitsSelection?e?`No committed changes against ${e}`:"No branch changes":"No changes in selected commits";default:return n}}',
     'function aTE(n,e,t){switch(n){case"uncommitted":return t.isCloudAgent?t.hasRemoteBranchOrPr?"所有更改已推送到远程分支":"云端智能体分支上尚无更改":"本地分支上没有未提交的更改";case"unstaged":return"没有未暂存的更改";case"staged":return"没有已暂存的更改";case"branch":return t.isAllCommitsSelection?e?`没有相对于 ${e} 的已提交更改`:"没有分支更改":"所选提交中没有更改";default:return n}}'],
    ['`No committed changes against ${e}`', '`没有相对于 ${e} 的已提交更改`'],

    // Glass 侧边栏顶部标签
    ['title:"Cloud Desktop"', 'title:"云端桌面"'],
    ['title:"Environment"', 'title:"环境"'],
    ['V(sf,{shortcut:Ae,title:"Changes"', 'V(sf,{shortcut:Ae,title:"更改"'],
    ['V(sf,{shortcut:$e,title:"Terminal"', 'V(sf,{shortcut:$e,title:"终端"'],
    ['title:"Browser"', 'title:"浏览器"'],
    ['title:"Files"', 'title:"文件"'],

    // 环境徽章（i$0 / 目标环境选择器）
    ['function i$0(n){return kJo(n)?{label:"Cloud",color:"cyan",icon:"cloud",title:"Target environment: cloud"}:{label:"Local",color:"green",icon:"laptop",title:"Target environment: local"}}',
     'function i$0(n){return kJo(n)?{label:"云端",color:"cyan",icon:"cloud",title:"目标环境：云端"}:{label:"本地",color:"green",icon:"laptop",title:"目标环境：本地"}}'],
    // 词典可能先改了 title，导致整段替换未命中 — 补打 label
    ['function i$0(n){return kJo(n)?{label:"Cloud",color:"cyan",icon:"cloud",title:"目标环境：云端"}:{label:"Local",color:"green",icon:"laptop",title:"目标环境：本地"}}',
     'function i$0(n){return kJo(n)?{label:"云端",color:"cyan",icon:"cloud",title:"目标环境：云端"}:{label:"本地",color:"green",icon:"laptop",title:"目标环境：本地"}}'],
    ['{label:"Cloud",color:"cyan",icon:"cloud",title:"目标环境：云端"}:{label:"Local",color:"green",icon:"laptop",title:"目标环境：本地"}',
     '{label:"云端",color:"cyan",icon:"cloud",title:"目标环境：云端"}:{label:"本地",color:"green",icon:"laptop",title:"目标环境：本地"}'],
    ['isCurrent:b==="local",label:"Local"', 'isCurrent:b==="local",label:"本地"'],
    ['isCurrent:b==="cloud",label:"Cloud"', 'isCurrent:b==="cloud",label:"云端"'],

    // Glass 文件页 — 空状态 / 文件树
    ['children:"No workspace folder open"', 'children:"未打开工作区文件夹"'],
    ['children:"Loading workspace\\u2026"', 'children:"正在加载工作区…"'],
    ['wK0="Open a file to get started",_K0="Select a file to view"',
     'wK0="打开文件以开始",_K0="选择要查看的文件"'],
    ['F("glass.fileTab.emptyState.openFile","Open File")', 'F("glass.fileTab.emptyState.openFile","打开文件")'],
    ['F("glass.fileTab.emptyState.newFile","New File")', 'F("glass.fileTab.emptyState.newFile","新建文件")'],
    ['F("glassFileTreeCreateFileLabel","New File")', 'F("glassFileTreeCreateFileLabel","新建文件")'],
    ['F("glassFileTreeCreateFolderLabel","New Folder")', 'F("glassFileTreeCreateFolderLabel","新建文件夹")'],
    ['F("glassFileTreeCreateFile","New File")', 'F("glassFileTreeCreateFile","新建文件")'],
    ['F("glassFileTreeCreateFolder","New Folder")', 'F("glassFileTreeCreateFolder","新建文件夹")'],
    ['F("glass.fileTab.largeFileGate.loadFile","Load file")', 'F("glass.fileTab.largeFileGate.loadFile","加载文件")'],
    ['F("glass.fileTab.largeFileGate.markdownMessage","Markdown preview paused ({0})"',
     'F("glass.fileTab.largeFileGate.markdownMessage","Markdown 预览已暂停 ({0})"'],
    ['F("glass.fileTab.largeFileGate.codeMessage","File is large ({0})"',
     'F("glass.fileTab.largeFileGate.codeMessage","文件较大 ({0})"'],
  ];

  let updated = content;
  for (const [from, to] of replacements) {
    updated = updated.split(from).join(to);
  }
  return updated;
}

translate(paths);

let jsContent = fs.readFileSync(paths.mainJsPath, 'utf8');
jsContent = patchSidebarNavMap(jsContent);
fs.writeFileSync(paths.mainJsPath, jsContent, 'utf8');

console.log('\n🔧 正在补全侧边栏导航映射...');
if (patchNlsMessages(paths.appPath)) {
  console.log('✅ 已修补 nls.messages.json（安装损坏提示等）。');
}
if (fixAllProductChecksums(paths.productJsonPath, paths.appPath)) {
  console.log('✅ 已更新 product.json 全部校验值。');
} else {
  console.log('✅ 校验值已是最新。');
}

console.log('🎉 增强汉化完成！请重启 Cursor。');
