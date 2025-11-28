

export const MODEL_NAME = 'gemini-3-pro-image-preview';

export const DEFAULT_PROMPT_ZH = `为我生成图中角色的绘制 Q 版的，LINE 风格的半身像表情包，注意头饰要正确，彩色手绘风格，使用 4x6 布局，涵盖各种各样的常用聊天语句，或是一些有关的娱乐 meme，其他需求：不要原图复制。所有标注为手写简体中文，标注位置为表情右上。生成的图片需为 4K 分辨率 16:9`;

export const DEFAULT_PROMPT_EN = `Generate a Q-version, LINE-style half-body sticker pack for the character in the image. Ensure head accessories are correct. Colorful hand-drawn style. Use a 4x6 layout. Cover various common chat phrases or related entertainment memes. Do not copy the original image directly. All text should be handwritten English in the top-right corner of each sticker. Generated image must be 4K resolution, 16:9 aspect ratio.`;

export const BANNER_PROMPT_PREFIX_ZH = `请忽略之前的网格布局要求。基于该角色风格，生成一张微信表情包商城的横幅插画。`;
export const BANNER_PROMPT_SUFFIX_ZH = `\n\n详细要求：
1. 图片分辨率高，长宽比接近 2:1 (最终 750x400)。
2. 【绝对不要包含任何文字】。
3. 色调活泼明朗，色彩丰富，避免使用白色或透明背景，要能从白色界面中跳脱出来。
4. 画面要有故事性，展示角色的生动动态。
5. 必须是一张完整的横幅插画，不要网格，不要切片。`;

export const BANNER_PROMPT_PREFIX_EN = `Ignore previous grid layout instructions. Based on this character style, generate a banner illustration for a sticker shop.`;
export const BANNER_PROMPT_SUFFIX_EN = `\n\nRequirements:
1. High resolution, aspect ratio approx 2:1 (target 750x400).
2. NO TEXT in the image.
3. Lively, bright colors. Avoid white/transparent backgrounds.
4. Rich storytelling, showing dynamic character action.
5. Single full banner illustration, NO grid, NO slices.`;

export const TRANSLATIONS = {
  en: {
    title: "MemeGen Pro",
    subtitle: "AI Sticker Maker",
    uploadTitle: "Upload your photo",
    uploadDesc: "Drag & drop or click to browse",
    promptLabel: "Custom Prompt",
    promptPlaceholder: "Describe the sticker style...",
    generateBtn: "Generate Meme Pack",
    generatingBtn: "Generating Stickers...",
    bgRemoval: "Background Removal",
    tolerance: "White Tolerance",
    bgDesc: "Adjust to remove the white background.",
    grid: "Grid Layout",
    rows: "Rows",
    cols: "Columns",
    padding: "Padding / Zoom",
    offset: "Frame Adjustment",
    horizontal: "Horizontal",
    vertical: "Vertical",
    preview: "Preview Slices",
    download: "Download ZIP",
    reset: "Start Over",
    original: "Original Photo",
    model: "Model: Nano Banana Pro",
    error: "Failed to generate image. Please ensure you have selected a valid API Key.",
    generated: "Generated Sticker Sheet",
    tabStickers: "Sticker Sheet",
    tabBanner: "WeChat Banner",
    bannerTitle: "Promotional Banner",
    bannerDesc: "Generate a 750x400 banner for the WeChat Sticker Gallery. No text, lively colors.",
    generateBannerBtn: "Generate Banner",
    generatingBannerBtn: "Designing Banner...",
    downloadBanner: "Download Banner (750x400)",
    bannerError: "Failed to generate banner.",
    bannerEmpty: "Create a promotional banner to accompany your sticker pack."
  },
  zh: {
    title: "MemeGen Pro",
    subtitle: "AI 表情包制作器",
    uploadTitle: "上传你的照片",
    uploadDesc: "拖拽或点击上传",
    promptLabel: "自定义提示词",
    promptPlaceholder: "描述表情包的风格...",
    generateBtn: "生成表情包",
    generatingBtn: "正在生成...",
    bgRemoval: "背景移除",
    tolerance: "白色容差",
    bgDesc: "调节滑块以去除白色背景。",
    grid: "网格布局",
    rows: "行数",
    cols: "列数",
    padding: "内边距 / 缩放",
    offset: "选框位移",
    horizontal: "水平位移",
    vertical: "垂直位移",
    preview: "切片预览",
    download: "下载 ZIP",
    reset: "重新开始",
    original: "原图",
    model: "模型: Nano Banana Pro",
    error: "生成失败，请重试。请确保您已选择有效的 API 密钥。",
    generated: "生成的表情图",
    tabStickers: "表情包切片",
    tabBanner: "微信横幅",
    bannerTitle: "商城横幅",
    bannerDesc: "生成适用于微信表情商城的 750x400 像素横幅。无文字，色调活泼。",
    generateBannerBtn: "生成横幅",
    generatingBannerBtn: "正在设计横幅...",
    downloadBanner: "下载横幅 (750x400)",
    bannerError: "横幅生成失败，请重试。",
    bannerEmpty: "为你的表情包制作一张精美的推广横幅。"
  }
};
