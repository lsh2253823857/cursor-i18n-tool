#!/usr/bin/env node
const { spawnSync } = require('child_process');
const path = require('path');

const scripts = [
  'audit-menubar.js',
  'audit-scm.js',
  'audit-topbar.js',
  'audit-glass-files.js',
  'audit-file-menu-nls.js',
];

let failed = 0;
for (const script of scripts) {
  console.log(`\n${'='.repeat(48)}\n▶ ${script}\n`);
  const r = spawnSync(process.execPath, [path.join(__dirname, script)], { stdio: 'inherit' });
  if (r.status !== 0) failed++;
}

console.log(`\n${'='.repeat(48)}`);
console.log(failed === 0 ? '✅ 全部审计通过' : `❌ ${failed} 项审计失败`);
process.exit(failed > 0 ? 1 : 0);
