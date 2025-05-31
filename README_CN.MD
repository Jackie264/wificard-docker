# WiFi Card 生成器 (Docker版)

## 简介
这个项目是一个用于生成 Wi-Fi 连接二维码的工具，方便分享 Wi-Fi 凭证。

---

## **主要更新和技术栈升级**

在最近的开发迭代中，我们对项目的底层技术栈和构建部署流程进行了全面的升级和优化，旨在提升开发效率、构建速度、部署的稳定性和安全性。

**核心亮点包括：**

1.  **从 Create React App (CRA) 迁移到 Vite：**
    * **原因：** `create-react-app` 项目已进入维护模式，不再活跃开发。为了拥抱更现代的前端构建工具、获得更快的开发体验和生产构建速度，我们选择迁移到 Vite。
    * **改进：** Vite 提供了极速的开发服务器启动和模块热更新 (HMR)，显著提升了开发效率。其基于 ES Modules 的构建方式也带来了更高效的生产打包。
    * **实施：** 详细调整了 `package.json` 中的依赖和脚本，引入了 `vite.config.mjs` 进行 Vite 相关配置，并更新了 `index.html` 以适应 Vite 的入口文件加载机制。

2.  **Docker 化构建与部署流程优化：**
    * **目标：** 实现项目的容器化，确保开发、测试和生产环境的一致性，简化部署流程。
    * **改进：** 编写了健壮的 `Dockerfile`，用于将 React 应用构建成轻量级的 Docker 镜像。该 `Dockerfile` 包含多阶段构建，将应用构建与最终运行环境分离，以减小镜像体积和提升安全性。
    * **关键优化：**
        * 解决了 `husky` 工具在 Docker 构建环境中的冲突，彻底移除了不必要的 Git Hooks 依赖，确保构建流程的纯净性。
        * 解决了 `vite` 命令在 Docker 构建过程中找不到的问题，通过优化 `yarn install` 行为和确保 `$PATH` 正确配置，实现了 `vite build` 命令的顺利执行。
        * 将 `vite.config.js` 重命名为 `vite.config.mjs`，以遵循 Vite 官方推荐的 ES Modules 最佳实践，消除了相关构建警告。

3.  **依赖安全与版本管理 (Dependabot 集成)：**
    * **目标：** 持续监控和管理项目依赖中的安全漏洞及版本更新，确保项目始终使用最新的、安全的库。
    * **改进：** 集成了 GitHub Dependabot。通过配置 `.github/dependabot.yml` 文件，Dependabot 会自动扫描 `package.json` 和 `yarn.lock` 文件，并每周检查一次所有 `npm` 生态系统中的依赖更新和安全漏洞。
    * **问题解决：** 成功解决了 `semver` 库的 ReDoS 漏洞和 `postcss` 的兼容性问题，通过在 `package.json` 中使用 `overrides` 强制指定了安全的依赖版本。

---

## **如何使用/运行**

目前，项目已通过 Docker 镜像进行自动化部署。如果你想在本地运行或测试，请参考以下步骤：

1.  **克隆仓库：**
    ```bash
    git clone [你的仓库URL]
    cd [你的仓库名称]
    ```
2.  **构建 Docker 镜像：**
    ```bash
    docker build -t wifi-card-app .
    ```
3.  **运行 Docker 容器：**
    ```bash
    docker run -p 80:80 wifi-card-app
    ```
4.  **访问应用：** 在浏览器中访问 `http://localhost`。

---

## **贡献与反馈**

欢迎所有形式的贡献！如果你有任何问题、建议或发现了 bug，请随时提交 Issue 或 Pull Request。

---

## **许可证**

[MIT License]
