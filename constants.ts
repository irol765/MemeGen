



export const MODEL_NAME = 'gemini-3-pro-image-preview';

export const DEFAULT_PROMPT_ZH = `为我生成图中角色的绘制 Q 版的，LINE 风格的半身像表情包，注意头饰要正确，彩色手绘风格，使用 4x6 布局，涵盖各种各样的常用聊天语句，或是一些有关的娱乐 meme，其他需求：不要原图复制。所有标注为手写体简体中文，文字必须带有粗白色描边（以适应深色背景），标注位置为表情右上。背景必须是纯亮绿色(#00FF00)以便抠图。生成的图片需为 4K 分辨率 16:9`;

export const DEFAULT_PROMPT_EN = `Generate a Q-version, LINE-style half-body sticker pack for the character in the image. Ensure head accessories are correct. Colorful hand-drawn style. Use a 4x6 layout. Cover various common chat phrases or related entertainment memes. Do not copy the original image directly. All text should be handwritten English in the top-right corner of each sticker, with a thick white outline. Background must be solid bright green (#00FF00) for easy removal. Generated image must be 4K resolution, 16:9 aspect ratio.`;

export const GIF_PROMPT_TEMPLATE_ZH = `为我生成图中角色的 Q 版 GIF 动画分解图（Sprite Sheet）。注意头饰要正确。彩色手绘风格，严格使用 4x6 布局，共生成24个小图片。这24个小图片必须是“{action}”这一动作的【连续关键帧分解】，组成一个流畅、循环的动画。
1. 严禁大幅度位移，人物应保持在画面中央。
2. 动作幅度微小且细腻，避免夸张变形。
3. 最后一帧必须能流畅循环回第一帧。
4. 所有小图片包含汉字“{action}”。
5. 24个格子大小一致，图片不要越界。
6. 背景必须是纯亮绿色(#00FF00)以便抠图，不要画网格线。
7. 不要复制原图，重新绘制角色。图片比例16:9，4K分辨率`;

export const GIF_PROMPT_TEMPLATE_EN = `Generate a Q-version Sprite Sheet for a GIF animation of the character. Colorful hand-drawn style. STRICTLY use a [4 rows x 6 columns] layout (24 frames total). The 24 frames must represent a [continuous, smooth sequence] of keyframes for the action "{action}".
1. The character must stay centered; avoid large horizontal displacement.
2. Movements must be subtle and fluid, not exaggerated.
3. The last frame must loop smoothly back to the first frame.
4. All frames should include the text "{action}".
5. Ensure all 24 frames are uniform in size and do not overlap.
6. Background must be solid bright green (#00FF00) for easy removal. No grid lines.
7. Do not copy original image. Image aspect ratio 16:9, 4K resolution.`;

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

export const GUIDE_PROMPT_PREFIX_ZH = `请忽略之前的网格布局要求。基于该角色风格，生成一张微信表情包商城的【赞赏引导图】。`;
export const GUIDE_PROMPT_SUFFIX_ZH = `\n\n详细要求：
1. 图片比例接近 4:3 (最终 750x560)。
2. 画面要表现出“期待支持”、“求赞赏”或“比心”的可爱神态，吸引用户打赏。
3. 风格必须与之前的表情包完全一致。
4. 不要包含任何文字。
5. 背景不能是纯白，要丰满精美。`;

export const GUIDE_PROMPT_PREFIX_EN = `Ignore previous grid layout instructions. Based on this character style, generate a [Donation Guide Image] for the sticker shop.`;
export const GUIDE_PROMPT_SUFFIX_EN = `\n\nRequirements:
1. Aspect ratio approx 4:3 (target 750x560).
2. The character should look expectant, asking for support, or making a heart gesture to attract donations.
3. Style must be exactly consistent with the stickers.
4. NO TEXT.
5. Background should be colorful and complete.`;

export const THANKYOU_PROMPT_PREFIX_ZH = `请忽略之前的网格布局要求。基于该角色风格，生成一张微信表情包商城的【赞赏致谢图】。`;
export const THANKYOU_PROMPT_SUFFIX_ZH = `\n\n详细要求：
1. 图片比例 1:1 (最终 750x750)。
2. 画面要表现出极大的感激、开心、庆祝、鞠躬或飞吻的动作。
3. 风格必须与之前的表情包完全一致。
4. 不要包含任何文字。
5. 是一张完整的正方形插画。`;

export const THANKYOU_PROMPT_PREFIX_EN = `Ignore previous grid layout instructions. Based on this character style, generate a [Donation Thank You Image] for the sticker shop.`;
export const THANKYOU_PROMPT_SUFFIX_EN = `\n\nRequirements:
1. Aspect ratio 1:1 (target 750x750).
2. Character should express huge gratitude, happiness, celebration, bowing, or blowing a kiss.
3. Style must be exactly consistent with the stickers.
4. NO TEXT.
5. A complete square illustration.`;

export const TRANSLATIONS = {
  en: {
    title: "MemeGen Pro",
    subtitle: "AI Sticker Maker",
    uploadTitle: "Upload your photo",
    uploadDesc: "Drag & drop or click to browse",
    modeSticker: "Sticker Sheet",
    modeGif: "Animated GIF",
    promptLabel: "Custom Prompt",
    promptPlaceholder: "Describe the sticker style...",
    actionLabel: "Animation Action",
    actionPlaceholder: "e.g., Running, Crying, Laughing",
    generateBtn: "Generate Meme Pack",
    generateGifBtn: "Generate Animation",
    generatingBtn: "Generating Stickers...",
    generatingGifBtn: "Animating...",
    skipBtn: "Use Original Image",
    skipBtnDesc: "Skip AI generation. Use upload for Slicing or GIF.",
    bgRemoval: "Background Removal",
    tolerance: "Color Tolerance",
    bgDesc: "Adjust to remove the background color.",
    grid: "Grid Layout",
    rows: "Rows",
    cols: "Columns",
    padding: "Padding / Zoom",
    offset: "Frame Adjustment",
    horizontal: "Horizontal",
    vertical: "Vertical",
    preview: "Preview Slices",
    download: "Download ZIP",
    downloadGif: "Download GIF",
    reset: "Start Over",
    original: "Original Photo",
    model: "Model: Nano Banana Pro",
    error: "Failed to generate image. Please ensure you have selected a valid API Key.",
    generated: "Generated Sticker Sheet",
    tabStickers: "Sticker Sheet",
    tabBanner: "Banner",
    tabGif: "GIF",
    tabGuide: "Donation Guide",
    tabThankYou: "Thank You",
    bannerTitle: "Promotional Banner",
    bannerDesc: "Generate a 750x400 banner for the WeChat Sticker Gallery. No text, lively colors.",
    generateBannerBtn: "Generate Banner",
    generatingBannerBtn: "Designing Banner...",
    downloadBanner: "Download Banner (750x400)",
    bannerError: "Failed to generate banner.",
    bannerEmpty: "Create a promotional banner to accompany your sticker pack.",
    guideTitle: "Donation Guide Image",
    guideDesc: "Generate a 750x560 image shown when users select a donation amount. Attract support!",
    generateGuideBtn: "Generate Guide",
    generatingGuideBtn: "Designing Guide...",
    downloadGuide: "Download Guide (750x560)",
    guideError: "Failed to generate guide image.",
    guideEmpty: "Create an engaging image to encourage donations.",
    thankYouTitle: "Thank You Image",
    thankYouDesc: "Generate a 750x750 image shown after a user donates. Express gratitude!",
    generateThankYouBtn: "Generate Thank You",
    generatingThankYouBtn: "Designing Thank You...",
    downloadThankYou: "Download Thank You (750x750)",
    thankYouError: "Failed to generate thank you image.",
    thankYouEmpty: "Create a heartfelt image to thank your supporters.",
    frameRate: "Animation Speed",
    fps: "FPS",
    step1Title: "Step 1: Frame Editor",
    step1Desc: "Adjust tolerance and grid to ensure clean frames.",
    step2Title: "Step 2: Preview & Export",
    step2Desc: "Check the animation loop.",
    synthesizeGif: "Synthesize GIF",
    synthesizeDesc: "Click after adjusting the grid layout",
    previewHint: "Click 'Synthesize GIF' to preview"
  },
  zh: {
    title: "MemeGen Pro",
    subtitle: "AI 表情包制作器",
    uploadTitle: "上传你的照片",
    uploadDesc: "拖拽或点击上传",
    modeSticker: "静态表情包",
    modeGif: "动态 GIF",
    promptLabel: "自定义提示词",
    promptPlaceholder: "描述表情包的风格...",
    actionLabel: "动作/表情描述",
    actionPlaceholder: "例如：奔跑、大哭、大笑",
    generateBtn: "生成表情包",
    generateGifBtn: "生成动态表情",
    generatingBtn: "正在生成...",
    generatingGifBtn: "正在绘制动画...",
    skipBtn: "直接使用原图",
    skipBtnDesc: "跳过 AI 生成，直接使用原图进行切片或制作 GIF。",
    bgRemoval: "背景移除",
    tolerance: "颜色容差",
    bgDesc: "调节滑块以去除背景颜色。",
    grid: "网格布局",
    rows: "行数",
    cols: "列数",
    padding: "内边距 / 缩放",
    offset: "选框位移",
    horizontal: "水平位移",
    vertical: "垂直位移",
    preview: "切片预览",
    download: "下载 ZIP",
    downloadGif: "下载 GIF",
    reset: "重新开始",
    original: "原图",
    model: "模型: Nano Banana Pro",
    error: "生成失败，请重试。请确保您已选择有效的 API 密钥。",
    generated: "生成的表情图",
    tabStickers: "表情包切片",
    tabBanner: "微信横幅",
    tabGif: "动态预览",
    tabGuide: "赞赏引导图",
    tabThankYou: "赞赏致谢图",
    bannerTitle: "商城横幅",
    bannerDesc: "生成适用于微信表情商城的 750x400 像素横幅。无文字，色调活泼。",
    generateBannerBtn: "生成横幅",
    generatingBannerBtn: "正在设计横幅...",
    downloadBanner: "下载横幅 (750x400)",
    bannerError: "横幅生成失败，请重试。",
    bannerEmpty: "为你的表情包制作一张精美的推广横幅。",
    guideTitle: "赞赏引导图",
    guideDesc: "赞赏引导图展示在选择赞赏金额页面的图片(750x560)，用于吸引用户发赞赏。",
    generateGuideBtn: "生成引导图",
    generatingGuideBtn: "正在设计引导图...",
    downloadGuide: "下载引导图 (750x560)",
    guideError: "引导图生成失败，请重试。",
    guideEmpty: "制作一张吸引人的引导图，提升用户赞赏意愿。",
    thankYouTitle: "赞赏致谢图",
    thankYouDesc: "用户发完赞赏后，展示在答谢页面的图片(750x750)。激发用户的分享意愿。",
    generateThankYouBtn: "生成致谢图",
    generatingThankYouBtn: "正在设计致谢图...",
    downloadThankYou: "下载致谢图 (750x750)",
    thankYouError: "致谢图生成失败，请重试。",
    thankYouEmpty: "制作一张充满诚意的致谢图，感谢你的支持者。",
    frameRate: "动画速度",
    fps: "帧率",
    step1Title: "第一步：帧编辑",
    step1Desc: "调节容差与网格，确保每一帧背景抠除干净。",
    step2Title: "第二步：预览与导出",
    step2Desc: "检查动画流畅度。",
    synthesizeGif: "合成 GIF 动画",
    synthesizeDesc: "调整好网格和背景后点击此按钮",
    previewHint: "点击右侧“合成 GIF 动画”按钮预览"
  }
};
