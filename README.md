# Cursor i18n Tool · Cursor 增强汉化包

[![GitHub stars](https://img.shields.io/github/stars/lsh2253823857/cursor-i18n-tool?style=social)](https://github.com/lsh2253823857/cursor-i18n-tool)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](#环境要求)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS-lightgrey.svg)](#快速开始)

**Community patch that finishes what Cursor's official Chinese pack leaves in English — Glass, Git, settings, menus — without the “installation is corrupt” warning.**

面向 **Cursor IDE** 的社区增强汉化：在官方中文包基础上，补齐 Glass 智能体界面、设置页、Git/SCM、文件页、顶部菜单等残留英文，并自动同步 `product.json` 校验值。

> **Disclaimer / 声明**：非官方工具，与 Cursor 无关。通过修改本地安装文件实现；更新 Cursor 后需重新打补丁。请先完全退出 Cursor 并自行备份，风险自负。

---

## Why this?

装了官方中文，Glass / Agents / Git 里还是一堆英文？  
本工具做三件事：**词典批量替换 → 精确补丁 → 校验值同步**，尽量做到「汉化率更高，还不报损坏」。

---

## What's covered

| Module | What it does |
|--------|----------------|
| 词典批量替换 | `dict.js` 安全长句 + 短词 UI 精准替换 |
| 精确补丁 | `apply-ecursor.js` 针对菜单、Git、Glass、文件页硬编码字符串 |
| NLS 索引补丁 | 修补 `nls.messages.json`（关闭窗口、退出、新建智能体窗口等） |
| 校验值同步 | 自动更新 `product.json` checksum，避免「安装已损坏」 |
| 可还原 | 首次运行自动 `.backup`，`npm run restore` 一键回英文 |
| 审计脚本 | `audits/` 多项自动化检测 |

**界面覆盖（持续更新）：** 顶部菜单 · 设置页（Agents / Models / Network 等）· Git/SCM · Glass 侧边栏 · 文件页空状态 · 文件菜单。

---

## Requirements

- Node.js **18+**
- Cursor 已安装（Windows / macOS）
- 对 Cursor 安装目录有**写入权限**

---

## Quick start（≤3 步核心）

```bash
git clone https://github.com/lsh2253823857/cursor-i18n-tool.git
cd cursor-i18n-tool
npm install
copy config.example.json config.json   # macOS/Linux: cp config.example.json config.json
```

编辑 `config.json`，填入你的 Cursor `resources/app` 路径，例如：

```json
{
  "cursorAppPath": "E:/cursor/resources/app"
}
```

| Platform | Typical path |
|----------|----------------|
| Windows（默认） | `%LOCALAPPDATA%\Programs\cursor\resources\app` |
| Windows（自定义） | 如 `E:\cursor\resources\app` |
| macOS | `/Applications/Cursor.app/Contents/Resources/app` |

确保语言为中文（`locale.json` → `"locale": "zh-cn"`），然后：

1. **完全退出 Cursor**（任务管理器确认无 `Cursor.exe`）  
2. `npm run apply`  
3. 再打开 Cursor，检查界面  

可选验证：`npm run audit`  
恢复英文：`npm run restore`

也可用环境变量（优先级更高）：

```powershell
$env:CURSOR_APP_PATH = "E:\cursor\resources\app"
```

---

## After Cursor updates

自动更新会覆盖 workbench 文件。更新后请：完全退出 → `npm run apply` → 重启。  
若 `.backup` 仍是旧版，可删掉 `workbench.desktop.main.js.backup` 再跑一遍，工具会按新版重新备份。

---

## How it works

1. **备份**：首次运行创建 `.backup`；再次运行先还原干净原版，避免补丁叠加。  
2. **词典替换**：按长度优先匹配 `dict.js`。  
3. **精确补丁**：`apply-ecursor.js` 做 targeted replace。  
4. **NLS 补丁**：按索引改 `nls.messages.json`。  
5. **校验值**：重算 `product.json` 相关 hash。

---

## Project layout

```
cursor-i18n-tool/
├── apply.js              # 入口：应用汉化
├── apply-ecursor.js      # 增强补丁（Glass/Git/文件页/nls）
├── restore.js            # 恢复英文
├── i18n-core.js          # 词典替换、备份、校验值
├── dict.js               # 翻译词典
├── paths.js / platform.js
├── config.example.json
└── audits/               # 自动化审计
```

---

## FAQ

**界面仍是英文？**  
是否完全退出并重启（重载窗口不够）；`locale.json` 是否 `zh-cn`；路径是否打对（多版本并存时注意）；跑一下 `npm run audit`。

**提示「安装已损坏」？**  
重新 `npm run apply`；检查杀毒是否拦截对 `product.json` 的写入。

**Glass 和普通窗口菜单不一样？**  
正常现象：Glass 智能体窗口与普通 IDE 窗口的菜单由 Cursor 原版设计决定，不是汉化漏项。

**权限不足？**  
Windows 下对默认安装目录写入失败时，用管理员终端，或把 Cursor 装到可写目录（如 `E:\cursor`）。

---

## Contributing

欢迎 Issue / PR 补漏译。建议：精确上下文优先写进 `apply-ecursor.js`；通用文案进 `dict.js`；短词慎用全局替换；同步更新 `audits/`。

---

## License

MIT

## Thanks

基于社区 `cursor-i18n-tool` 思路扩展；词典与补丁由实际界面走查迭代积累。

---

如果帮你把 Cursor 用顺了，点一颗 ⭐ 就是最大支持。
