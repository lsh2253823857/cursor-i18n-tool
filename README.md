# Cursor 增强汉化包

面向 **Cursor IDE** 的社区增强汉化工具，在官方中文语言包基础上，对 Glass 智能体界面、设置页、Git/SCM 面板、文件页、顶部菜单等仍残留的英文进行补丁式翻译，并自动修复 `product.json` 校验值，避免出现「安装已损坏」提示。

> **声明**：本项目为非官方社区工具，与 Cursor 官方无关。汉化通过修改本地安装文件实现，Cursor 更新后需重新运行补丁。使用风险自负，建议在应用前关闭 Cursor 并自行备份。

---

## 特性

| 模块 | 说明 |
|------|------|
| 词典批量替换 | `dict.js` 安全长句 + 短词 UI 属性精准替换 |
| 精确补丁 | `apply-ecursor.js` 针对菜单、Git、Glass 标签、文件页等硬编码字符串 |
| NLS 索引补丁 | 修补 `nls.messages.json` 中文件菜单等条目（如关闭窗口、退出、新建智能体窗口） |
| 校验值同步 | 自动更新 `product.json` 中全部 checksum，消除损坏警告 |
| 可还原 | 首次运行自动备份 `.backup` 文件，支持一键恢复英文 |
| 审计脚本 | `audits/` 目录下多项自动化检测 |

### 已覆盖界面（持续更新）

- 顶部菜单：文件 / 编辑 / 查看 / 帮助及 Glass 子菜单
- 设置页：Agents、Models、Network、Window Layout 等
- Git/SCM：更改页、本地/云端徽章、空仓库提示
- Glass 侧边栏标签：更改、云端桌面、终端、环境、浏览器、文件
- 文件页：空状态、打开文件、新建文件、未打开工作区提示
- 文件菜单：新建智能体窗口、关闭窗口、退出

---

## 环境要求

- **Node.js** 18+
- **Cursor** 已安装（Windows / macOS）
- 对 Cursor 安装目录有**写入权限**（Windows 自定义路径如 `E:\cursor` 通常可直接写；默认 `%LOCALAPPDATA%\Programs\cursor` 可能需要管理员权限）

---

## 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/<你的用户名>/cursor-i18n-tool.git
cd cursor-i18n-tool
npm install
```

### 2. 配置 Cursor 路径

复制示例配置并修改为你的实际安装路径：

```bash
copy config.example.json config.json
```

`config.json` 示例：

```json
{
  "cursorAppPath": "E:/cursor/resources/app"
}
```

也可使用环境变量（优先级更高）：

```powershell
$env:CURSOR_APP_PATH = "E:\cursor\resources\app"
```

**常见路径：**

| 平台 | 默认路径 |
|------|----------|
| Windows（默认安装） | `%LOCALAPPDATA%\Programs\cursor\resources\app` |
| Windows（自定义） | 如 `E:\cursor\resources\app` |
| macOS | `/Applications/Cursor.app/Contents/Resources/app` |

### 3. 设置 Cursor 显示语言

确保用户配置中存在：

`%APPDATA%\Cursor\User\locale.json`（Windows）或 `~/Library/Application Support/Cursor/User/locale.json`（macOS）：

```json
{
  "locale": "zh-cn"
}
```

### 4. 应用汉化

**先完全退出 Cursor**（任务管理器中确认无 `Cursor.exe`），然后：

```bash
npm run apply
```

### 5. 验证（可选）

```bash
npm run audit
```

### 6. 重启 Cursor

完全退出后再打开，检查界面是否已为中文。

---

## 恢复英文

```bash
npm run restore
```

将从 `.backup` 还原 `workbench.desktop.main.js`、`workbench.html`、`product.json` 及 `nls.messages.json`（若已备份）。

---

## 项目结构

```
cursor-i18n-tool/
├── apply.js              # 入口：应用汉化
├── apply-ecursor.js      # 增强补丁（Glass/Git/文件页/nls 等）
├── restore.js            # 恢复英文
├── i18n-core.js          # 核心引擎：词典替换、备份、校验值
├── dict.js               # 翻译词典
├── paths.js              # 安装路径探测
├── platform.js           # 跨平台工具（路径探测、提权）
├── config.example.json   # 配置示例
├── audits/               # 自动化审计脚本
│   ├── run-all.js
│   ├── audit-menubar.js
│   ├── audit-scm.js
│   ├── audit-topbar.js
│   ├── audit-glass-files.js
│   └── audit-file-menu-nls.js
└── package.json
```

---

## 工作原理

1. **备份**：首次运行时，对将被修改的文件创建 `.backup` 副本；再次运行前先从备份还原干净原版，避免重复补丁叠加损坏。
2. **词典替换**：按长度优先匹配 `dict.js` 中的英文 UI 字符串。
3. **精确补丁**：`apply-ecursor.js` 对函数级、菜单注册级字符串做 targeted replace。
4. **NLS 补丁**：按索引修改 `out/nls.messages.json` 中菜单项文案。
5. **校验值**：重算 `product.json` 内所有相关文件的 hash。

---

## Cursor 更新后

每次 Cursor 自动更新都会覆盖 `workbench.desktop.main.js`。更新后请：

1. 完全退出 Cursor  
2. 重新运行 `npm run apply`  
3. 重启 Cursor  

若更新后 `.backup` 仍是旧版本，可手动删除 `workbench.desktop.main.js.backup` 后重新运行，工具会基于新版重新备份。

---

## 常见问题

### 界面仍是英文？

- 是否**完全退出并重启**（重载窗口不够）
- `locale.json` 是否为 `zh-cn`
- 是否对**正确的安装路径**打了补丁（多版本 Cursor 并存时注意路径）
- 运行 `npm run audit` 查看补丁是否生效

### 提示「安装已损坏」？

补丁脚本会自动同步校验值。若仍出现，请重新运行 `npm run apply`，或检查杀毒软件是否拦截了对 `product.json` 的写入。

### 图一和图二菜单不一样？

这是 **正常现象**：**Glass 智能体窗口**与**普通 IDE 窗口**的菜单项由 Cursor 原版设计决定（Glass 窗口通常没有「运行」「终端」，且「新建智能体窗口」在已打开智能体窗口时会隐藏）。不是汉化导致菜单缺失。

### 权限不足？

Windows 下对 `Program Files` 或 `%LOCALAPPDATA%\Programs\cursor` 写入失败时，请以管理员身份运行终端，或将 Cursor 安装到可写目录（如 `E:\cursor`）。

---

## 贡献

欢迎提交 Issue / PR 补充遗漏翻译。新增词条建议：

1. 优先在 `apply-ecursor.js` 做**精确上下文**替换  
2. 通用 UI 文案加入 `dict.js` 的 `safeGlobalDict`  
3. 短词慎用全局替换，避免破坏代码逻辑  
4. 在 `audits/` 中增加或更新检测项  

---

## 许可证

MIT

---

## 致谢

- 基于社区 `cursor-i18n-tool` 思路扩展  
- 词典与补丁由实际界面走查迭代积累  
