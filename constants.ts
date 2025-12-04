

export const MODEL_NAME = 'gemini-3-pro-image-preview';

export const DEFAULT_PROMPT_ZH = `为我生成图中角色的 Q 版 LINE 风格表情包。
1. **风格要求**：使用干净、清晰的**矢量平涂风格**或**赛璐璐风格**。**严禁**使用蜡笔、粉笔、彩铅或素描质感。色彩要明亮、饱满，注意头饰要正确，不得在任何地方显示品牌logo。
2. **布局要求**：使用 4x6 布局，单个表情包含文字大小不得超过230*230像素。
3. **内容要求**：
   - 涵盖各种常用的聊天语句（如：好的、谢谢、惊讶、生气、晚安等）。
   - **动作匹配**：每个表情的动作必须与文字内容**完美贴合**且生动夸张，**严禁**所有表情使用类似的姿势，动作要有极大的区分度。
   - 不要原图复制，要重新创作。
4. **文字要求**：所有标注为手写简体中文，位于表情右上角。**文字必须带有粗白色描边**以适应深色背景。
5. **技术要求**：
   - 背景必须是纯亮绿色(#00FF00)以便抠图。
   - 生成的图片需为 4K 分辨率 16:9。
   - 单个表情内容需紧凑，避免过多留白。`;

export const DEFAULT_PROMPT_EN = `Generate a Q-version, LINE-style sticker pack for the character.
1. **Style**: Use clean, clear **vector/flat color style** or **Celluloid style**. **DO NOT** use crayon, chalk, colored pencil, or sketch textures. Colors should be bright and solid, Ensure the headgear is properly worn and should not display any brand logos anywhere.

.
2. **Layout**: Use a 4x6 grid layout. Each sticker (including text) must not exceed 230x230 pixels within the grid.
3. **Content**:
   - Cover various common chat phrases (e.g., OK, Thanks, Shocked, Angry, Goodnight).
   - **Action Matching**: The action of each sticker must **perfectly match** the text/emotion. **Avoid** repetitive poses; ensure high variety in body language.
   - Do not copy the original image directly.
4. **Text**: Handwritten English in the top-right corner. **Text must have a thick white outline**.
5. **Technical**:
   - Background must be solid bright green (#00FF00) for easy removal.
   - Image must be 4K resolution, 16:9 aspect ratio.
   - Keep individual stickers compact.`;

export const GIF_PROMPT_TEMPLATE_ZH = `为我生成图中角色的 Q 版 GIF 动画分解图（Sprite Sheet）。注意头饰要正确。
1. **风格**：干净的矢量平涂风格，严禁蜡笔质感。**角色主体必须带有粗白色描边**，以保证在深色背景下清晰可见。
2. **布局**：严格使用 4x6 布局（共24帧），单个图案大小不得超过230*230像素。
3. **动作**：这24个小图片必须是“{action}”这一动作的【连续关键帧分解】，组成一个流畅、循环的动画。
   - 严禁大幅度位移，人物应保持在画面中央。
   - 最后一帧必须能流畅循环回第一帧。
4. **文字**：**严禁**包含任何文字。只展示动作。
5. **技术**：背景必须是纯亮绿色(#00FF00)以便抠图。不要画网格线。图片比例16:9，4K分辨率`;

export const GIF_PROMPT_TEMPLATE_EN = `Generate a Q-version Sprite Sheet for a GIF animation of the character.
1. **Style**: Clean vector/flat color style, NO crayon textures. **Character must have a thick white outline** for visibility on dark backgrounds.
2. **Layout**: STRICTLY use a [4 rows x 6 columns] layout (24 frames total). Each frame content must not exceed 230x230 pixels.
3. **Action**: The 24 frames must represent a [continuous, smooth sequence] for the action "{action}".
   - Character must stay centered.
   - The last frame must loop smoothly back to the first frame.
4. **Text**: **NO TEXT**. Show the action only.
5. **Technical**: Background must be solid bright green (#00FF00). No grid lines. Image aspect ratio 16:9, 4K resolution.`;

export const BANNER_PROMPT_PREFIX_ZH = `请忽略之前的网格布局要求。基于该角色风格，生成一张微信表情包商城的横幅插画，不能使用任何emoji元素。`;
export const BANNER_PROMPT_SUFFIX_ZH = `\n\n详细要求：
1. 图片分辨率高，长宽比接近 2:1 (最终 750x400)。
2. 【绝对不要包含任何文字】。
3. 色调活泼明朗，色彩丰富，避免使用白色或透明背景，要能从白色界面中跳脱出来。
4. 画面要有故事性，展示角色的生动动态。
5. 必须是一张完整的横幅插画，不要网格，不要切片。`;

export const BANNER_PROMPT_PREFIX_EN = `Ignore previous grid layout instructions. Based on this character style, generate a banner illustration for a sticker shop, Do not use any emoji elements.`;
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
5. **背景严禁使用绿色**。必须是绘制精美的、有丰富细节的装饰性背景（如爱心、光芒、星星等图案）。不要留白，不要纯色背景。`;

export const GUIDE_PROMPT_PREFIX_EN = `Ignore previous grid layout instructions. Based on this character style, generate a [Donation Guide Image] for the sticker shop.`;
export const GUIDE_PROMPT_SUFFIX_EN = `\n\nRequirements:
1. Aspect ratio approx 4:3 (target 750x560).
2. The character should look expectant, asking for support, or making a heart gesture to attract donations.
3. Style must be exactly consistent with the stickers.
4. NO TEXT.
5. **Background MUST NOT be green**. It must be a fully painted, detailed decorative background (e.g. hearts, sparkles, stars). NO solid colors.`;

export const THANKYOU_PROMPT_PREFIX_ZH = `请忽略之前的网格布局要求。基于该角色风格，生成一张微信表情包商城的【赞赏致谢图】。`;
export const THANKYOU_PROMPT_SUFFIX_ZH = `\n\n详细要求：
1. 图片比例 1:1 (最终 750x750)。
2. 画面要表现出极大的感激、开心、庆祝、鞠躬或飞吻的动作。
3. 风格必须与之前的表情包完全一致。
4. 不要包含任何文字。
5. 是一张完整的正方形插画。**背景严禁使用绿色**，背景必须是绘制精美的装饰性背景。不要纯色背景。`;

export const THANKYOU_PROMPT_PREFIX_EN = `Ignore previous grid layout instructions. Based on this character style, generate a [Donation Thank You Image] for the sticker shop.`;
export const THANKYOU_PROMPT_SUFFIX_EN = `\n\nRequirements:
1. Aspect ratio 1:1 (target 750x750).
2. Character should express huge gratitude, happiness, celebration, bowing, or blowing a kiss.
3. Style must be exactly consistent with the stickers.
4. NO TEXT.
5. A complete square illustration. **Background MUST NOT be green**. Use a detailed decorative background. NO solid colors.`;

export const COVER_PROMPT_PREFIX_ZH = `请忽略之前的网格布局要求。基于该角色风格，生成一张微信表情包商城的【表情封面图】。`;
export const COVER_PROMPT_SUFFIX_ZH = `\n\n详细要求：
1. **图片分辨率必须是 4K 超高清** (Ultra HD)，细节极其丰富，线条锐利，无压缩痕迹。
2. 选取最具辨识度的形象，建议使用表情形象**正面半身像或全身像**。
3. **严禁**出现任何文字。
4. **严禁**出现白色描边。
5. **严禁**出现锯齿或模糊。
6. **自动抠图优化**：背景必须是**纯平涂亮绿色(#00FF00)** (Solid Flat Green)。**绝对不可有**投影、阴影、环境光遮蔽、渐变、纹理或光照效果。背景色块必须完全均匀，以便程序一键移除。
7. 图片布局合理，角色尽量填满画面，减少留白。
8. 风格为干净的矢量平涂，颜色鲜艳。`;

export const COVER_PROMPT_PREFIX_EN = `Ignore previous grid layout instructions. Generate a [Sticker Pack Cover Image] for the shop.`;
export const COVER_PROMPT_SUFFIX_EN = `\n\nRequirements:
1. **Resolution must be 4K Ultra HD**. Extremely sharp details, clean lines.
2. Most recognizable character image, suggest using **frontal half-body or full-body**.
3. **NO TEXT**.
4. **NO WHITE OUTLINE**.
5. No aliasing/jagged edges.
6. **Background Optimization**: Must be **Solid Flat Green (#00FF00)**. **NO shadows, NO gradients, NO texture, NO floor projection, NO ambient occlusion**. The green must be perfectly uniform for automatic removal.
7. Minimize whitespace, fill the frame.
8. Clean vector/flat style.`;

export const ICON_PROMPT_PREFIX_ZH = `请忽略之前的网格布局要求。基于该角色风格，生成一张微信表情包商城的【表情图标】。`;
export const ICON_PROMPT_SUFFIX_ZH = `\n\n详细要求：
1. **图片分辨率必须是 4K 超高清** (Ultra HD)。
2. **小尺寸优化**：选取最具辨识度的**头部正面特写**。**线条必须加粗，对比度要高，去除细碎的细节**，确保缩小到 50x50 像素时依然清晰可辨。
3. **严禁**出现任何文字。
4. **严禁**出现白色描边。
5. **严禁**出现装饰元素。
6. **严禁**出现正方形边框或直角边缘。
7. **自动抠图优化**：背景必须是**纯平涂亮绿色(#00FF00)** (Solid Flat Green)。**绝对不可有**投影、阴影、环境光遮蔽、渐变或纹理。背景必须是死板的纯绿色。
8. 减少留白，头像尽量填满画面（占比>80%）。
9. 风格为干净的矢量平涂。`;

export const ICON_PROMPT_PREFIX_EN = `Ignore previous grid layout instructions. Generate a [Sticker Pack Icon] for the shop.`;
export const ICON_PROMPT_SUFFIX_EN = `\n\nRequirements:
1. **Resolution must be 4K Ultra HD**.
2. **Small Size Optimization**: Most recognizable **frontal headshot**. Use **bold lines, high contrast, and simplified details**. Ensure it is readable even when resized to 50x50 pixels.
3. **NO TEXT**.
4. **NO WHITE OUTLINE**.
5. NO decorative elements.
6. NO square borders or hard edges.
7. **Background Optimization**: Must be **Solid Flat Green (#00FF00)**. **NO shadows, NO gradients, NO texture, NO floor projection**. The green must be perfectly uniform.
8. Minimize whitespace. Face should occupy >80% of image.
9. Clean vector/flat style.`;

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
    tabCover: "Cover",
    tabIcon: "Icon",
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
    coverTitle: "Sticker Cover",
    coverDesc: "230x230px PNG. Recognizable half-body or full-body. No white outline, transparent background.",
    generateCoverBtn: "Generate Cover",
    generatingCoverBtn: "Designing Cover...",
    downloadCover: "Download Cover (230x230)",
    coverError: "Failed to generate cover.",
    coverEmpty: "Create the main cover image for your sticker pack.",
    iconTitle: "Sticker Icon",
    iconDesc: "50x50px PNG. Clear headshot/face only. No text, no border, transparent background.",
    generateIconBtn: "Generate Icon",
    generatingIconBtn: "Designing Icon...",
    downloadIcon: "Download Icon (50x50)",
    iconError: "Failed to generate icon.",
    iconEmpty: "Create the small icon for the sticker list.",
    frameRate: "Animation Speed",
    fps: "FPS",
    step1Title: "Step 1: Frame Editor",
    step1Desc: "Adjust tolerance and grid to ensure clean frames.",
    step2Title: "Step 2: Preview & Export",
    step2Desc: "Check the animation loop.",
    synthesizeGif: "Synthesize GIF",
    synthesizeDesc: "Click after adjusting the grid layout",
    previewHint: "Click 'Synthesize GIF' to preview",
    authTitle: "Security Check",
    authDesc: "This service is protected. Please enter the access code to continue.",
    authPlaceholder: "Enter Access Code",
    authButton: "Unlock App",
    authError: "Incorrect access code. Please try again.",
    bgRemovalActive: "Background Removal Active",
    bgRemovalActiveDesc: "The green background will be automatically removed when you click download. Adjust the **Color Tolerance** slider below if needed.",
    
    // Settings Translations
    settingsTitle: "API Settings",
    apiKeyRequired: "API Key Required",
    apiKeyRequiredDesc: "No default API key was found. Please enter your Google Gemini API key or a custom proxy key to continue.",
    apiKeyLabel: "API Key",
    apiKeyNote: "Your key is stored locally in your browser.",
    baseUrlLabel: "API Base URL (Proxy)",
    baseUrlPlaceholder: "https://your-proxy.com",
    baseUrlNote: "Optional. Enter the full base URL (e.g., https://api.openai.com).",
    proxyLabel: "OpenAI Compatible Interface",
    proxyNote: "Enable this if using a 3rd party proxy (NewAPI/OneAPI) that expects OpenAI chat format.",
    saveSettings: "Save Settings",
    cancel: "Cancel"
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
    tabCover: "表情封面",
    tabIcon: "表情图标",
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
    coverTitle: "表情封面",
    coverDesc: "230x230像素 PNG。最具辨识度的正面半身/全身像。无白边，透明背景。",
    generateCoverBtn: "生成封面",
    generatingCoverBtn: "正在设计封面...",
    downloadCover: "下载封面 (230x230)",
    coverError: "封面生成失败，请重试。",
    coverEmpty: "制作一张最具代表性的表情包封面图。",
    iconTitle: "表情图标",
    iconDesc: "50x50像素 PNG。清晰头部正面特写。无文字、无边框、无装饰，透明背景。",
    generateIconBtn: "生成图标",
    generatingIconBtn: "正在设计图标...",
    downloadIcon: "下载图标 (50x50)",
    iconError: "图标生成失败，请重试。",
    iconEmpty: "制作一张简洁清晰的表情包列表图标。",
    frameRate: "动画速度",
    fps: "帧率",
    step1Title: "第一步：帧编辑",
    step1Desc: "调节容差与网格，确保每一帧背景抠除干净。",
    step2Title: "第二步：预览与导出",
    step2Desc: "检查动画流畅度。",
    synthesizeGif: "合成 GIF 动画",
    synthesizeDesc: "调整好网格和背景后点击此按钮",
    previewHint: "点击右侧“合成 GIF 动画”按钮预览",
    authTitle: "访问验证",
    authDesc: "本服务受保护，请输入部署时设置的安全码以继续使用。",
    authPlaceholder: "请输入安全码",
    authButton: "解锁应用",
    authError: "安全码错误，请重试。",
    bgRemovalActive: "自动抠图已启用",
    bgRemovalActiveDesc: "绿色背景将在下载时自动移除。如下载后背景未去除干净，请调整下方的“颜色容差”滑块。",

    // Settings Translations
    settingsTitle: "API 设置",
    apiKeyRequired: "需要 API 密钥",
    apiKeyRequiredDesc: "未检测到默认 API 密钥。请输入您的 Google Gemini API 密钥或自定义代理密钥以继续。",
    apiKeyLabel: "API 密钥",
    apiKeyNote: "您的密钥仅保存在本地浏览器中。",
    baseUrlLabel: "API 代理地址 (Base URL)",
    baseUrlPlaceholder: "https://api.openai.com",
    baseUrlNote: "可选。输入完整的 Base URL (例如 https://api.openai.com)。",
    proxyLabel: "OpenAI 兼容模式",
    proxyNote: "如果您使用第三方代理（如 NewAPI/OneAPI）并需要 OpenAI 格式，请开启此项。",
    saveSettings: "保存设置",
    cancel: "取消"
  }
};
