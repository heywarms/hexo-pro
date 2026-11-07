<p align="center">
  <img src="docs/banner.jpg" alt="Hexo Pro：写作、主题、同步、部署" width="100%">
</p>

<p align="center">
  <strong>Hexo Pro，一个可视化的 Hexo 博客后台</strong><br>
  支持文章编辑、主题预览与切换、图片管理和一键部署。
</p>

<p align="center">
  <a href="https://github.com/heywarms/hexo-pro/releases/latest"><img src="https://img.shields.io/github/v/release/heywarms/hexo-pro?label=%E6%AD%A3%E5%BC%8F%E7%89%88" alt="正式版"></a>
  <a href="https://github.com/heywarms/hexo-pro/releases"><img src="https://img.shields.io/github/v/release/heywarms/hexo-pro?include_prereleases&label=%E6%B5%8B%E8%AF%95%E7%89%88&color=orange" alt="测试版"></a>
  <a href="https://github.com/heywarms/hexo-pro"><img src="https://img.shields.io/github/stars/heywarms/hexo-pro?style=flat&logo=github" alt="GitHub stars"></a>
  <a href="https://www.npmjs.com/package/hexo-pro"><img src="https://img.shields.io/npm/dm/hexo-pro" alt="npm 下载量"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/github/license/heywarms/hexo-pro" alt="MIT 许可证"></a>
</p>

<p align="center">
  <a href="#快速开始">快速开始</a> ·
  <a href="#界面预览">界面预览</a> ·
  <a href="#常见问题">常见问题</a> ·
  <a href="./README_en.md">English</a>
</p>

## 功能

Hexo Pro 是 Hexo 的可视化管理工具，文章编辑、主题配置和站点部署都可以在界面中完成。文章仍以 Markdown 文件保存在博客目录中。

<p align="center">
  <img src=".github/assets/demo.gif" alt="在块编辑器中插入引用，右侧的主题预览自动更新" width="100%">
</p>

| 功能 | 说明 |
| --- | --- |
| **文章编辑** | 提供类似 Notion 的块编辑器，输入 `/` 可插入标题、表格和图片，也可以切换到 Markdown 源码。内容自动保存。 |
| **主题预览** | 编辑文章时可以同时预览当前主题的效果，不用先生成网站。 |
| **主题管理** | 内置安知鱼、Butterfly、NexT、Fluid、Stellar 和 Volantis，支持在界面中安装、切换和配置。 |
| **图片管理** | 支持粘贴上传，图片可以存放在本地、阿里云 OSS、七牛云或腾讯云 COS。 |
| **站点部署** | 支持一键部署到 GitHub Pages、Cloudflare Pages 和 EdgeOne Pages。 |
| **手机写作** | 提供 Android 和 iOS App，支持离线写作，通过 GitHub 与电脑同步。同一篇文章两边都有修改时，可以选择保留的版本。 |
| **AI 与 MCP** | 接入自己的 AI 服务后可以使用写作助手；支持 MCP，Agent 可以搜索文章、撰写草稿、发布和部署。 |

此外还支持全局搜索、回收站、YAML 配置编辑、深色模式和中英文界面。桌面端支持切换多个博客和自动更新。

> **2.1 目前是测试版。** 块编辑器、主题预览、手机 App、GitHub 同步、MCP 和桌面端自动更新是 2.1 新增的功能，正式版 2.0.0 不包含。升级前请备份博客源文件。

## 快速开始

| 情况 | 推荐方式 |
| --- | --- |
| 不想安装 Node.js，或还没有博客 | [桌面 App](#桌面-app) |
| 已有 Hexo 博客，熟悉命令行 | [Hexo 插件](#hexo-插件) |
| 需要在手机上写文章 | [手机 App](#手机-app) |

### 桌面 App

安装包自带 Node.js、npm 和 Git，无需提前安装。支持 Windows 10+、macOS 12+ 和 Ubuntu 22.04+。

1. 下载对应系统的 2.1.0 Beta 3 安装包：

   | 系统 | 下载 |
   | --- | --- |
   | Mac（Apple 芯片） | [DMG](https://github.com/heywarms/hexo-pro/releases/download/v2.1.0-beta.3/Hexo-Pro-Desktop-2.1.0-beta.3-mac-arm64.dmg) |
   | Mac（Intel 芯片） | [DMG](https://github.com/heywarms/hexo-pro/releases/download/v2.1.0-beta.3/Hexo-Pro-Desktop-2.1.0-beta.3-mac-x64.dmg) |
   | Windows（x64） | [EXE](https://github.com/heywarms/hexo-pro/releases/download/v2.1.0-beta.3/Hexo-Pro-Desktop-2.1.0-beta.3-win-x64.exe) |
   | Linux（x64） | [AppImage](https://github.com/heywarms/hexo-pro/releases/download/v2.1.0-beta.3/Hexo-Pro-Desktop-2.1.0-beta.3-linux-x86_64.AppImage) |

2. 打开 App，选择已有的博客目录，或新建一个博客。
3. 编辑文章，完成后在「部署」页面发布。

如果系统提示无法打开，请查看[常见问题](#常见问题)。正式版请前往 [2.0.0 下载页](https://github.com/heywarms/hexo-pro/releases/tag/v2.0.0)。

### Hexo 插件

需要 Node.js 20.19 或更新版本，以及 Hexo 8。在博客目录中安装：

```bash
npm install --save https://github.com/heywarms/hexo-pro/releases/download/v2.1.0-beta.3/hexo-pro-2.1.0-beta.3.tgz
```

启动博客：

```bash
npx hexo server
```

然后在浏览器中打开 <http://localhost:4000/pro/>。首次进入时可以设置账号密码，也可以稍后设置。

安装正式版 2.0.0：

```bash
npm install --save hexo-pro
```

> **注意：** 2.1 的后续测试版只发布在 GitHub。npm 的 `beta` 标签还停留在 2.1.0-beta.0，`npm install hexo-pro@beta` 安装的是旧版本，请使用上面的地址安装。

### 手机 App

手机 App 不依赖电脑和服务器。文章保存在手机上，通过自己的 GitHub 仓库同步。

- **Android 7+**：下载[测试版 APK](https://github.com/heywarms/hexo-pro/releases/download/v2.1.0-beta.3/HexoPro-2.1.0-beta.3-android-debug.apk)。这是测试签名的安装包，尚未上架应用商店。
- **iPhone（iOS 16.4+）**：尚未上架 App Store 和 TestFlight。发布页的安装包只能安装到已登记的测试设备，其他设备需要使用 Xcode 自行构建。

GitHub 连接和构建步骤见[手机 App 指南](https://github.com/heywarms/hexo-pro-client/blob/master/docs/MOBILE_APP.md)。

## 界面预览

<table>
  <tr>
    <td width="50%"><img src="docs/screenshots/dashboard.jpg" alt="工作台"></td>
    <td width="50%"><img src="docs/screenshots/themes.jpg" alt="主题市场"></td>
  </tr>
  <tr>
    <td align="center"><sub>工作台：最近编辑、草稿和部署概况</sub></td>
    <td align="center"><sub>主题市场：主题安装、切换和配置</sub></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/screenshots/deploy.jpg" alt="部署页面"></td>
    <td width="50%" align="center"><img src="docs/screenshots/mobile.jpg" alt="手机 App" width="34%"></td>
  </tr>
  <tr>
    <td align="center"><sub>部署：GitHub Pages、Cloudflare Pages 和 EdgeOne Pages</sub></td>
    <td align="center"><sub>手机 App：离线写作和 GitHub 同步</sub></td>
  </tr>
</table>

## 常见问题

**文章会被转换成其他格式吗？**

不会。文章仍是 Hexo 的 Markdown 文件和 Front Matter，存放位置不变。后台账号、设置等数据保存在博客目录的 `data/` 和 `.hexo-pro/` 中。

**后台会被发布到网站上吗？**

不会。后台只在 `hexo server` 或桌面 App 运行时可用，`hexo generate` 生成的静态网站不包含后台。如果在公网服务器上运行 `hexo server`，请务必设置账号密码。

**系统提示无法打开 App 怎么办？**

测试版的 Mac 安装包已签名，但尚未经过 Apple 公证；Windows 安装包没有代码签名，系统可能会拦截。

- **Mac**：在「系统设置 → 隐私与安全性」中点击「仍要打开」。
- **Windows**：在 SmartScreen 提示中点击「更多信息」，再点击「仍要运行」。
- **Linux**：先运行 `chmod +x` 为 AppImage 添加执行权限，再打开。

**桌面 App 如何更新？**

从 2.1.0 Beta 2 开始支持自动更新。App 在后台下载新版本，确认后重启安装，也可以在「设置 → 帮助与更新」中关闭自动下载。更早的版本需要手动安装。

**插件如何换回正式版？**

在博客目录运行 `npm install --save hexo-pro@2.0.0`。更换版本前建议先备份。

**遇到问题如何反馈？**

通过 [GitHub Issues](https://github.com/heywarms/hexo-pro/issues) 反馈，或加入 QQ 群 1009585669。

## 更多文档

- [手机 App 指南](https://github.com/heywarms/hexo-pro-client/blob/master/docs/MOBILE_APP.md)
- [云同步与源码上传](https://github.com/heywarms/hexo-pro-client/blob/master/docs/SOURCE_SYNC.md)
- [编辑器说明](https://github.com/heywarms/hexo-pro-client/blob/master/docs/EDITOR.md)
- [Agent / MCP 接入](https://github.com/heywarms/hexo-pro-client/blob/master/docs/HERMES_AGENT_INTEGRATION.md)（英文）
- [桌面端自动更新](https://github.com/heywarms/hexo-pro-desktop/blob/master/docs/AUTO_UPDATE.md)

## 更新日志

完整说明和各版本下载见 [Releases](https://github.com/heywarms/hexo-pro/releases)。

**2.1.0 Beta 3（2026-11-07）**

- 修复 Volantis 安装失败和 Stellar 切换失败。
- 修复装了插件后 `hexo clean` 不生效、换主题后混入旧主题资源的问题。
- 修复部分主题预览空白、表格单元格换行和找回密码的问题。

**2.1.0 Beta 2（2026-10-16）**

- 桌面端内置 Node.js、npm、Git 和博客模板，并新增自动更新。
- 统一浅色和深色界面，改进块编辑器和 GitHub 同步。

**2.1.0 Beta 1（2026-10-15）**

- 重新整理工作台、文章列表、编辑器和各设置页面。
- 编辑器支持直接粘贴图片和调整图片宽度。

**2.1.0 Beta（2026-10-13）**

- 新增块编辑器、主题预览、GitHub 同步、手机 App 和 MCP。

<details>
<summary>更早的版本</summary>

**2.0.0（2026-03-17）**

- 核心版本升级到 `2.0.0`，与客户端、桌面端的版本策略对齐。
- 统一并锁定 `cheerio` 版本为 `1.0.0-rc.12`，避免发布时出现 `EOVERRIDE` 冲突。
- 从 `1.x` 升级后，建议重新安装依赖再启动。

**1.2.6（2025-06-15）**

- 修复 Front Matter 中布尔值的展示和设置问题。
- 桌面端可自动加载项目 `node_modules` 中的 Hexo 插件。
- 桌面端跳转链接默认指向 `localhost:4000`，也可以自定义。
- 新增编辑器默认模式、封面隐藏和跳过静态文件生成的部署选项。

**1.2.4（2025-06-07）**

- 新增桌面端子项目，支持多项目管理。
- 优化核心 API 结构，改善桌面端和 Web 端的协同。

**1.2.0（2025-05-10）**

- 新增图床管理、YAML 配置管理、设置和主页功能。

**1.1.16（2024-08-29）**

- 优化编辑器体验，改进深色模式，增强全局搜索。

</details>

## 参与贡献

欢迎提交 [Issue](https://github.com/heywarms/hexo-pro/issues) 和 Pull Request，也欢迎加入 QQ 群交流。

<p align="center">
  <img src="docs/qq-group.png" width="150" alt="QQ 群二维码：1009585669"><br>
  <sub>QQ 群：1009585669</sub>
</p>

## 打赏支持

如果你觉得本项目不错，可以请我喝杯咖啡 ☕️，支持项目持续优化！

<p align="center">
  <img src="docs/donate_alipay.jpg" width="150" alt="支付宝打赏二维码">
  <img src="docs/donate_wc.jpg" width="150" alt="微信打赏二维码">
</p>

感谢以下用户对项目的支持，排名不分先后，您的捐助是我们持续开发的动力！

<table align="center">
  <tr>
    <td align="center">
      <img src="docs/sponsors/sponsor_vk.jpg" width="60" height="60" alt="v快"><br>
      <sub><b>v快</b></sub>
    </td>
    <td align="center">
      <img src="docs/sponsors/sponsor_empty.jpg" width="60" height="60" alt="神秘支持者"><br>
      <sub><b>神秘支持者</b></sub>
    </td>
    <td align="center">
      <img src="docs/sponsors/sponsor_crosery.png" width="60" height="60" alt="Crosery"><br>
      <sub><b>Crosery</b></sub>
    </td>
  </tr>
</table>

想成为捐助者？扫描上方二维码支持项目，并联系我们添加您的头像。

## 项目结构

Hexo Pro 由三个仓库组成：

| 仓库 | 内容 | 技术 |
| --- | --- | --- |
| [hexo-pro](https://github.com/heywarms/hexo-pro)（本仓库） | Hexo 插件、后台接口、Agent 和 MCP 命令 | Node.js、Express、NeDB |
| [hexo-pro-client](https://github.com/heywarms/hexo-pro-client) | 网页界面和手机 App，也是开发主仓库 | React、TypeScript、Capacitor |
| [hexo-pro-desktop](https://github.com/heywarms/hexo-pro-desktop) | 桌面客户端 | Electron |

## 许可证

[MIT](./LICENSE) © [heywarms](https://github.com/heywarms)
