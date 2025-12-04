# MemeGen Pro - AI 表情包制作器

[English Documentation](README.md)

![image](https://github.com/irol765/MemeGen/blob/main/img/cn.png)

[Demo](https://memedemo.puzhenyi.net)

这是一个现代化的 React 应用程序，利用 Google 的 Gemini 3 Pro (Nano Banana Pro) 模型将您的照片变成 LINE/微信 风格的表情包。

## 功能特性

1.  **AI 生成**: 使用 `gemini-3-pro-image-preview` 模型，根据参考照片生成高质量、4K 分辨率的图像。
2.  **多模式支持**:
    *   **静态表情包**: 生成 4x6 布局的静态表情网格。
    *   **动态 GIF**: 生成动作分解图（Sprite Sheet）并合成循环 GIF 动画。
3.  **商城素材生成**: 一站式生成微信/LINE 表情商店所需的所有素材：
    *   **横幅**: 推广横幅 (750x400)。
    *   **封面**: 表情包主封面 (230x230)。
    *   **图标**: 列表小图标 (50x50)。
    *   **赞赏引导图**: 吸引打赏的图片 (750x560)。
    *   **致谢图**: 打赏后的感谢图片 (750x750)。
4.  **智能编辑器**:
    *   **背景移除**: 客户端算法（色度键）自动移除生成的绿色背景，实现透明底。
    *   **切片**: 根据网格自动切割成单独的 PNG 文件。
    *   **GIF 合成**: 将网格帧合成为流畅的 GIF，支持调节帧率。
5.  **自定义 API 设置**:
    *   **自定义 Key**: 支持在前端设置界面输入 Google Gemini API Key，无需后端环境变量。
    *   **第三方代理**: 支持 OpenAI 格式的 API 代理（如 NewAPI/OneAPI），可自定义 API Base URL。
6.  **导出**: 支持打包下载 ZIP 或单独下载生成的素材。
7.  **安全**: 支持设置访问密码（Access Code）保护部署。
8.  **PWA 支持**: 支持 iOS "添加到主屏幕"，像原生 App 一样使用。

## 前置条件

*   Node.js 18+ (用于本地开发) 或 Docker 环境
*   拥有已启用 Gemini API 的 Google Cloud 项目。
*   **注意**: 本应用使用付费模型 `gemini-3-pro-image-preview`。

## 开发指南

1.  安装依赖:
    ```bash
    npm install
    ```

2.  启动开发服务器:
    ```bash
    npm start
    ```

## Docker 本地部署

你可以使用 Docker Compose 在本地快速启动应用。

1.  **克隆仓库**到本地。
2.  **启动容器**:
    ```bash
    docker-compose up -d
    ```
3.  **访问应用**:
    在浏览器中打开 `http://localhost:3000`。

4.  **环境配置**:
    您可以在 `docker-compose.yml` 中设置环境变量，或创建 `.env` 文件：
    ```env
    API_KEY=your_google_api_key_here
    ACCESS_CODE=optional_password_protection
    ```
    *如果未在环境变量中设置 `API_KEY`，应用启动后会提示用户在前端设置界面手动输入。*

## 部署到 Vercel

1.  将此代码推送到 GitHub 仓库。
2.  将仓库导入 Vercel。
3.  **环境变量**:
    进入 Vercel 项目设置 > Environment Variables 并添加:
    *   `API_KEY`: 您的 Google Gemini API 密钥。
    *   `ACCESS_CODE` (可选): 用于保护您部署应用的访问密码。如果设置了此变量，用户必须输入该安全码才能使用应用。
    
    *注意：如果提供了 `API_KEY`，应用将直接使用它。如果设置了 `ACCESS_CODE`，应用会显示锁定界面。*

4.  部署！Vercel 会自动检测 React 框架并构建项目。

## 使用指南

1.  **安全验证**: 如果部署环境设置了 `ACCESS_CODE`，首先输入安全码解锁应用。
2.  **设置**: 点击右上角齿轮图标，可配置 API Key 或 代理地址（如果服务器未预设）。
3.  **上传**: 拖放一张人物或角色的照片。
4.  **提示词**: 
    *   **静态表情**: 默认使用 "Q版、4x6 布局" 的优化提示词。
    *   **GIF**: 输入具体动作（如“奔跑”），AI 将生成连续动作帧。
5.  **编辑与导出**:
    *   **表情切片**: 使用 "颜色容差" 滑块移除绿色背景。切片并下载 ZIP。
    *   **GIF**: 调整网格以对齐动作帧，设置帧率，点击“合成 GIF”。
    *   **商城素材**: 切换标签页（横幅、封面、图标等），一键生成并下载符合平台规范的图片。