#!/usr/bin/env node
const { restore } = require('./i18n-core');
const { getCursorPaths } = require('./paths');

const paths = getCursorPaths();
console.log('📂 Cursor 路径:', paths.appPath);
restore(paths);
