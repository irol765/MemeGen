
import React, { useState, useEffect } from 'react';
import { GridConfig, StickerSlice, Language, AppMode } from '../types';
import { removeBackground, sliceImageToBlobs, createAndDownloadZip, generateGif, cropCoverToSize, cropIconToSize } from '../utils/imageProcessing';
import { Download, Grid, Layers, Eraser, RefreshCw, Move, Image as ImageIcon, Sparkles, Film, PlayCircle, Minus, Plus, Heart, Gift, Settings2, Play, LayoutTemplate, SquareUser, Loader2 } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface NumberControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
  suffix?: string;
}

const NumberControl: React.FC<NumberControlProps> = ({ label, value, min, max, step = 1, onChange, suffix = '' }) => {
  const handleDecrease = () => onChange(Math.max(min, value - step));
  const handleIncrease = () => onChange(Math.min(max, value + step));

  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-slate-600 font-medium">{label}</span>
        <span className="font-mono text-indigo-600">{value}{suffix}</span>
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={handleDecrease}
          className="w-10 h-10 flex-none flex items-center justify-center bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-lg text-slate-600 transition-colors"
          aria-label="Decrease"
        >
          <Minus size={18} />
        </button>
        <div className="flex-1">
          <input 
            type="range" 
            min={min} 
            max={max} 
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 block"
          />
        </div>
        <button 
          onClick={handleIncrease}
          className="w-10 h-10 flex-none flex items-center justify-center bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-lg text-slate-600 transition-colors"
          aria-label="Increase"
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
};

interface EditorSectionProps {
  initialImageSrc: string;
  onReset: () => void;
  lang: Language;
  
  onGenerateBanner: () => void;
  bannerImage: string | null;
  isGeneratingBanner: boolean;
  bannerError: string | null;

  onGenerateGuide: () => void;
  guideImage: string | null;
  isGeneratingGuide: boolean;
  guideError: string | null;

  onGenerateThankYou: () => void;
  thankYouImage: string | null;
  isGeneratingThankYou: boolean;
  thankYouError: string | null;

  onGenerateCover: () => void;
  coverImage: string | null;
  isGeneratingCover: boolean;
  coverError: string | null;

  onGenerateIcon: () => void;
  iconImage: string | null;
  isGeneratingIcon: boolean;
  iconError: string | null;
  
  mode: AppMode;
}

const EditorSection: React.FC<EditorSectionProps> = ({ 
  initialImageSrc, 
  onReset, 
  lang,
  
  onGenerateBanner,
  bannerImage,
  isGeneratingBanner,
  bannerError,

  onGenerateGuide,
  guideImage,
  isGeneratingGuide,
  guideError,

  onGenerateThankYou,
  thankYouImage,
  isGeneratingThankYou,
  thankYouError,

  onGenerateCover,
  coverImage,
  isGeneratingCover,
  coverError,

  onGenerateIcon,
  iconImage,
  isGeneratingIcon,
  iconError,

  mode
}) => {
  const [activeTab, setActiveTab] = useState<'stickers' | 'banner' | 'gif' | 'guide' | 'thankYou' | 'cover' | 'icon'>('stickers');

  useEffect(() => {
    if (mode === AppMode.GIF) {
       setActiveTab('gif');
    }
  }, [mode]);

  const [config, setConfig] = useState<GridConfig>({
    rows: 4,
    cols: 6,
    padding: 5,
    tolerance: 15,
    offsetX: 0,
    offsetY: 0
  });

  const [processedImage, setProcessedImage] = useState<string>(initialImageSrc);
  const [slices, setSlices] = useState<StickerSlice[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // States for real-time preview of background removal on Cover and Icon
  const [processedCover, setProcessedCover] = useState<string | null>(null);
  const [isProcessingCover, setIsProcessingCover] = useState(false);
  
  const [processedIcon, setProcessedIcon] = useState<string | null>(null);
  const [isProcessingIcon, setIsProcessingIcon] = useState(false);
  
  // GIF State
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [fps, setFps] = useState<number>(8);
  const [isGeneratingGif, setIsGeneratingGif] = useState(false);
  // Track if GIF needs update
  const [isGifOutdated, setIsGifOutdated] = useState(true);

  const t = TRANSLATIONS[lang];
  
  // Debounce effect for background removal (Main Sticker Sheet)
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const result = await removeBackground(initialImageSrc, config.tolerance);
        setProcessedImage(result);
        setIsGifOutdated(true);
      } catch (e) {
        console.error("BG Removal failed", e);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [initialImageSrc, config.tolerance]);

  // Debounce effect for background removal (Cover)
  useEffect(() => {
    if (!coverImage) {
        setProcessedCover(null);
        return;
    }
    setIsProcessingCover(true);
    const timer = setTimeout(async () => {
      try {
        const result = await removeBackground(coverImage, config.tolerance);
        setProcessedCover(result);
      } catch (e) {
        console.error("Cover BG Removal failed", e);
      } finally {
        setIsProcessingCover(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [coverImage, config.tolerance]);

  // Debounce effect for background removal (Icon)
  useEffect(() => {
    if (!iconImage) {
        setProcessedIcon(null);
        return;
    }
    setIsProcessingIcon(true);
    const timer = setTimeout(async () => {
      try {
        const result = await removeBackground(iconImage, config.tolerance);
        setProcessedIcon(result);
      } catch (e) {
        console.error("Icon BG Removal failed", e);
      } finally {
        setIsProcessingIcon(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [iconImage, config.tolerance]);


  // Effect to re-slice when grid or processed image changes
  useEffect(() => {
    const doSlice = async () => {
      setIsProcessing(true);
      try {
        const newSlices = await sliceImageToBlobs(processedImage, config);
        setSlices(newSlices);
        setIsGifOutdated(true);
      } catch (e) {
        console.error("Slicing failed", e);
      } finally {
        setIsProcessing(false);
      }
    };
    doSlice();
  }, [processedImage, config.rows, config.cols, config.padding, config.offsetX, config.offsetY]);

  // Mark GIF as outdated when FPS changes
  useEffect(() => {
    setIsGifOutdated(true);
  }, [fps]);

  // Manual GIF Generation Trigger
  const handleGenerateGifPreview = async () => {
    if (slices.length === 0) return;
    
    setIsGeneratingGif(true);
    setGifUrl(null); // Clear previous GIF while generating
    
    try {
        // Short timeout to allow UI to update to loading state
        await new Promise(resolve => setTimeout(resolve, 100));
        const url = await generateGif(slices, fps);
        setGifUrl(url);
        setIsGifOutdated(false);
    } catch (e) {
        console.error("GIF generation failed", e);
    } finally {
        setIsGeneratingGif(false);
    }
  };

  const handleDownloadStickers = () => {
    createAndDownloadZip(slices);
  };

  const handleDownloadBanner = () => {
    if (!bannerImage) return;
    const link = document.createElement('a');
    link.href = bannerImage;
    link.download = 'wechat_banner_750x400.png';
    link.click();
  };

  const handleDownloadGuide = () => {
    if (!guideImage) return;
    const link = document.createElement('a');
    link.href = guideImage;
    link.download = 'wechat_donation_guide_750x560.png';
    link.click();
  };

  const handleDownloadThankYou = () => {
    if (!thankYouImage) return;
    const link = document.createElement('a');
    link.href = thankYouImage;
    link.download = 'wechat_thank_you_750x750.png';
    link.click();
  };

  const handleDownloadCover = async () => {
    if (!coverImage) return;
    // We now receive the high-res image.
    // 1. Remove background on high-res first
    try {
        // Use processedCover if available to match preview, otherwise process fresh
        const transparentHighRes = processedCover || await removeBackground(coverImage, config.tolerance);
        // 2. Resize/Crop to 230x230
        const finalImage = await cropCoverToSize(transparentHighRes);
        
        const link = document.createElement('a');
        link.href = finalImage;
        link.download = 'wechat_cover_230x230.png';
        link.click();
    } catch (e) {
        console.error("Failed to process cover background", e);
        // Fallback
        const link = document.createElement('a');
        link.href = coverImage;
        link.download = 'wechat_cover_230x230_raw.png';
        link.click();
    }
  };

  const handleDownloadIcon = async () => {
    if (!iconImage) return;
    // We now receive the high-res image.
    // 1. Remove background on high-res first (cleaner edges)
    try {
        // Use processedIcon if available to match preview, otherwise process fresh
        const transparentHighRes = processedIcon || await removeBackground(iconImage, config.tolerance);
        // 2. Resize/Crop to 50x50
        const finalImage = await cropIconToSize(transparentHighRes);

        const link = document.createElement('a');
        link.href = finalImage;
        link.download = 'wechat_icon_50x50.png';
        link.click();
    } catch (e) {
        console.error("Failed to process icon background", e);
        const link = document.createElement('a');
        link.href = iconImage;
        link.download = 'wechat_icon_50x50_raw.png';
        link.click();
    }
  };

  const handleDownloadGif = () => {
      if (!gifUrl) return;
      const link = document.createElement('a');
      link.href = gifUrl;
      link.download = 'meme_animation.gif';
      link.click();
  };

  const checkerboardStyle = {
    backgroundColor: '#f1f5f9', // slate-100 base
    backgroundImage: `
      linear-gradient(45deg, #cbd5e1 25%, transparent 25%),
      linear-gradient(-45deg, #cbd5e1 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #cbd5e1 75%),
      linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)
    `,
    backgroundSize: '20px 20px',
    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
  };

  const TabButton = ({ id, label, icon: Icon, active }: any) => (
    <button
        onClick={() => setActiveTab(id)}
        className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
        active 
            ? 'bg-indigo-600 text-white shadow-md' 
            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
        }`}
    >
        {Icon && <Icon size={18} />}
        {label}
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Tabs - Scrollable on mobile */}
      <div className="flex justify-center overflow-x-auto pb-2">
        <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 inline-flex">
          <TabButton id="stickers" label={t.tabStickers} icon={Grid} active={activeTab === 'stickers'} />
          
          {mode === AppMode.GIF && (
             <TabButton id="gif" label={t.tabGif} icon={Film} active={activeTab === 'gif'} />
          )}

          <TabButton id="cover" label={t.tabCover} icon={LayoutTemplate} active={activeTab === 'cover'} />
          <TabButton id="icon" label={t.tabIcon} icon={SquareUser} active={activeTab === 'icon'} />

          <TabButton id="banner" label={t.tabBanner} icon={ImageIcon} active={activeTab === 'banner'} />
          <TabButton id="guide" label={t.tabGuide} icon={Heart} active={activeTab === 'guide'} />
          <TabButton id="thankYou" label={t.tabThankYou} icon={Gift} active={activeTab === 'thankYou'} />
        </div>
      </div>
      
      {(activeTab === 'stickers' || activeTab === 'gif') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start animate-fade-in-up">
          {/* Left Column: Visual Editor & Previews */}
          <div className="space-y-8">
              
              {/* 1. Main Visual Editor (Step 1) */}
              <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-200 relative group select-none">
                  {activeTab === 'gif' && (
                    <div className="absolute top-0 left-0 w-full bg-slate-100 border-b border-slate-200 p-2 z-10 flex items-center justify-center gap-2 text-slate-700 text-sm font-bold">
                       <Settings2 size={16}/> {t.step1Title}
                    </div>
                  )}
                  <div className={`relative w-full ${activeTab === 'gif' ? 'mt-10' : ''}`} style={checkerboardStyle}>
                      <img 
                          src={processedImage} 
                          alt="Generated Sticker Sheet" 
                          className="w-full h-auto block"
                      />
                      
                      <div 
                          className="absolute inset-0 pointer-events-none"
                          style={{
                              display: 'grid',
                              gridTemplateRows: `repeat(${config.rows}, 1fr)`,
                              gridTemplateColumns: `repeat(${config.cols}, 1fr)`
                          }}
                      >
                          {Array.from({ length: config.rows * config.cols }).map((_, i) => (
                              <div 
                                  key={i} 
                                  className="relative border border-indigo-500/20"
                              >
                                  <div 
                                      className="absolute border-2 border-red-500 shadow-[0_0_4px_rgba(239,68,68,0.6)]"
                                      style={{
                                          left: `${config.padding + config.offsetX}%`,
                                          right: `${config.padding - config.offsetX}%`,
                                          top: `${config.padding + config.offsetY}%`,
                                          bottom: `${config.padding - config.offsetY}%`,
                                      }}
                                  >
                                      <div className="w-full h-full bg-red-500/5 hover:bg-red-500/10 transition-colors" />
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
                  
                  {activeTab === 'stickers' && (
                    <div className="absolute top-4 right-4 bg-white/80 text-slate-700 text-xs font-bold px-2 py-1 rounded backdrop-blur shadow-sm border border-slate-200">
                        {t.generated}
                    </div>
                  )}
              </div>

              {/* Slices Preview */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                  <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                          <Layers size={20} />
                      </div>
                      <h3 className="font-bold text-slate-800">{t.preview} ({slices.length})</h3>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3 p-4 bg-slate-50 rounded-xl min-h-[200px] max-h-[600px] overflow-y-auto custom-scrollbar">
                      {slices.map((slice) => (
                          <div key={slice.id} className="aspect-square bg-white rounded border border-slate-200 overflow-hidden flex items-center justify-center shadow-sm relative group hover:ring-2 ring-indigo-500 transition-all">
                              <img src={slice.previewUrl} className="max-w-full max-h-full" alt="slice" />
                              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                          </div>
                      ))}
                  </div>
              </div>

              {/* 2. GIF Preview (Step 2 - Bottom) */}
              {activeTab === 'gif' && (
                  <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 text-center flex flex-col items-center justify-center relative overflow-hidden animate-fade-in-up">
                      <div className="absolute top-0 left-0 w-full bg-indigo-50 border-b border-indigo-100 p-3 flex items-center justify-center gap-2 text-indigo-800 text-sm font-bold">
                        <PlayCircle size={16}/> {t.step2Title}
                      </div>
                      <div className="mt-10 mb-4 w-full flex justify-center">
                        {gifUrl ? (
                            <div className="relative rounded-lg overflow-hidden border-2 border-slate-100 shadow-sm bg-white" style={checkerboardStyle}>
                              <img src={gifUrl} alt="Generated GIF" className="max-w-full max-h-[400px]" />
                            </div>
                        ) : (
                            <div className="w-full h-64 flex flex-col items-center justify-center text-slate-400 gap-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                {isGeneratingGif ? (
                                    <>
                                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-200 border-t-indigo-600"></div>
                                        <span>{t.generatingGifBtn}</span>
                                    </>
                                ) : (
                                    <>
                                        <Film size={48} className="text-slate-300" />
                                        <span className="text-sm">{t.previewHint}</span>
                                    </>
                                )}
                            </div>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{t.step2Desc}</p>
                      
                      {isGifOutdated && !isGeneratingGif && gifUrl && (
                         <div className="mt-4 px-4 py-2 bg-yellow-50 text-yellow-700 text-xs rounded-lg border border-yellow-200">
                            Settings changed. Click "Synthesize" to update GIF.
                         </div>
                      )}
                  </div>
              )}

          </div>

          {/* Right Column: Controls */}
          <div className="space-y-6 lg:sticky lg:top-24">
              
              {/* BG Removal */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                  <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                          <Eraser size={20} />
                      </div>
                      <div className="flex-1">
                          <h3 className="font-bold text-slate-800">{t.bgRemoval}</h3>
                          {activeTab === 'gif' && <p className="text-xs text-indigo-600 mt-1">{t.step1Desc}</p>}
                      </div>
                  </div>
                  <div className="space-y-4">
                       <NumberControl
                          label={t.tolerance}
                          value={config.tolerance}
                          min={0}
                          max={50}
                          onChange={(val) => setConfig({...config, tolerance: val})}
                          suffix="%"
                       />
                       <p className="text-xs text-slate-400">
                          {t.bgDesc}
                       </p>
                  </div>
              </div>

              {/* Grid Config */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                  <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                          <Grid size={20} />
                      </div>
                      <h3 className="font-bold text-slate-800">{t.grid}</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">{t.rows}</label>
                          <input 
                              type="number" 
                              value={config.rows}
                              onChange={(e) => setConfig({...config, rows: Number(e.target.value)})}
                              className="w-full p-2 bg-slate-50 border rounded-lg text-center font-bold text-slate-700"
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">{t.cols}</label>
                          <input 
                              type="number" 
                              value={config.cols}
                              onChange={(e) => setConfig({...config, cols: Number(e.target.value)})}
                              className="w-full p-2 bg-slate-50 border rounded-lg text-center font-bold text-slate-700"
                          />
                      </div>
                  </div>
                  
                   <NumberControl
                      label={t.padding}
                      value={config.padding}
                      min={0}
                      max={40}
                      onChange={(val) => setConfig({...config, padding: val})}
                      suffix="%"
                   />
              </div>

              {/* Offsets */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                  <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                          <Move size={20} />
                      </div>
                      <h3 className="font-bold text-slate-800">{t.offset}</h3>
                  </div>

                  <div className="space-y-6">
                      <NumberControl
                          label={`${t.horizontal} (X)`}
                          value={config.offsetX}
                          min={-40}
                          max={40}
                          onChange={(val) => setConfig({...config, offsetX: val})}
                          suffix="%"
                       />
                       <NumberControl
                          label={`${t.vertical} (Y)`}
                          value={config.offsetY}
                          min={-40}
                          max={40}
                          onChange={(val) => setConfig({...config, offsetY: val})}
                          suffix="%"
                       />
                  </div>
              </div>

              {/* GIF Controls & Synthesis Button */}
               {activeTab === 'gif' && (
                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100 animate-fade-in-up">
                      <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                              <Film size={20} />
                          </div>
                          <h3 className="font-bold text-slate-800">{t.frameRate}</h3>
                      </div>
                       <NumberControl
                          label={t.fps}
                          value={fps}
                          min={1}
                          max={24}
                          onChange={(val) => setFps(val)}
                       />
                       
                       <div className="mt-6 pt-4 border-t border-slate-100">
                          <button
                             onClick={handleGenerateGifPreview}
                             disabled={isGeneratingGif}
                             className={`w-full py-3 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all ${
                                isGeneratingGif 
                                    ? 'bg-slate-300 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-300 active:scale-95'
                             }`}
                          >
                             {isGeneratingGif ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                             ) : (
                                <Play size={20} fill="currentColor" />
                             )}
                             {t.synthesizeGif}
                          </button>
                          <p className="text-center text-xs text-slate-400 mt-2">
                             {t.synthesizeDesc}
                          </p>
                       </div>
                  </div>
               )}

              {/* Download Buttons */}
              <div className="flex flex-col gap-3">
                  {activeTab === 'gif' ? (
                       <button 
                       onClick={handleDownloadGif}
                       disabled={!gifUrl || isGeneratingGif}
                       className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xl shadow-emerald-200 flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:bg-slate-300 disabled:shadow-none"
                   >
                       <Download size={20} />
                       {t.downloadGif}
                   </button>
                  ) : (
                    <button 
                        onClick={handleDownloadStickers}
                        disabled={isProcessing}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:bg-slate-300"
                    >
                        <Download size={20} />
                        {t.download}
                    </button>
                  )}

                   <button 
                      onClick={onReset}
                      className="w-full py-3 bg-white hover:bg-slate-50 text-slate-600 font-semibold rounded-xl border border-slate-200 flex items-center justify-center gap-2"
                  >
                      <RefreshCw size={18} />
                      {t.reset}
                  </button>
              </div>

          </div>
        </div>
      )}

      {/* Helper Component for Single Image Generation (Banner, Guide, Thank You, Cover, Icon) */}
      {['banner', 'guide', 'thankYou', 'cover', 'icon'].includes(activeTab) && (
        <div className="max-w-4xl mx-auto animate-fade-in-up space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 text-center">
                
                {/* Dynamic Content based on Active Tab */}
                {activeTab === 'banner' && (
                    <>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">{t.bannerTitle}</h3>
                        <p className="text-slate-500 mb-8 max-w-lg mx-auto">{t.bannerDesc}</p>
                        {bannerError && <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{bannerError}</div>}
                    </>
                )}
                {activeTab === 'guide' && (
                    <>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">{t.guideTitle}</h3>
                        <p className="text-slate-500 mb-8 max-w-lg mx-auto">{t.guideDesc}</p>
                        {guideError && <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{guideError}</div>}
                    </>
                )}
                {activeTab === 'thankYou' && (
                    <>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">{t.thankYouTitle}</h3>
                        <p className="text-slate-500 mb-8 max-w-lg mx-auto">{t.thankYouDesc}</p>
                        {thankYouError && <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{thankYouError}</div>}
                    </>
                )}
                {activeTab === 'cover' && (
                    <>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">{t.coverTitle}</h3>
                        <p className="text-slate-500 mb-8 max-w-lg mx-auto">{t.coverDesc}</p>
                        {coverError && <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{coverError}</div>}
                    </>
                )}
                {activeTab === 'icon' && (
                    <>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">{t.iconTitle}</h3>
                        <p className="text-slate-500 mb-8 max-w-lg mx-auto">{t.iconDesc}</p>
                        {iconError && <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{iconError}</div>}
                    </>
                )}

                {/* Empty State */}
                {((activeTab === 'banner' && !bannerImage && !isGeneratingBanner) ||
                  (activeTab === 'guide' && !guideImage && !isGeneratingGuide) ||
                  (activeTab === 'thankYou' && !thankYouImage && !isGeneratingThankYou) ||
                  (activeTab === 'cover' && !coverImage && !isGeneratingCover) ||
                  (activeTab === 'icon' && !iconImage && !isGeneratingIcon)) && (
                    <div className="flex flex-col items-center">
                        <div className={`w-full bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center mb-6
                            ${activeTab === 'banner' ? 'aspect-[2/1]' : 
                              activeTab === 'guide' ? 'aspect-[4/3]' : 
                              activeTab === 'icon' ? 'aspect-square max-w-[200px]' : 
                              'aspect-square max-w-[500px]'}`}
                        >
                            <p className="text-slate-400 font-medium">
                                {activeTab === 'banner' ? t.bannerEmpty : 
                                 activeTab === 'guide' ? t.guideEmpty : 
                                 activeTab === 'thankYou' ? t.thankYouEmpty :
                                 activeTab === 'cover' ? t.coverEmpty : t.iconEmpty}
                            </p>
                        </div>
                        <button
                            onClick={
                                activeTab === 'banner' ? onGenerateBanner : 
                                activeTab === 'guide' ? onGenerateGuide : 
                                activeTab === 'thankYou' ? onGenerateThankYou :
                                activeTab === 'cover' ? onGenerateCover : onGenerateIcon
                            }
                            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 flex items-center gap-2 transition-transform active:scale-95"
                        >
                            <Sparkles size={20} />
                            {activeTab === 'banner' ? t.generateBannerBtn : 
                             activeTab === 'guide' ? t.generateGuideBtn : 
                             activeTab === 'thankYou' ? t.generateThankYouBtn :
                             activeTab === 'cover' ? t.generateCoverBtn : t.generateIconBtn}
                        </button>
                    </div>
                )}

                {/* Loading State */}
                {((activeTab === 'banner' && isGeneratingBanner) ||
                  (activeTab === 'guide' && isGeneratingGuide) ||
                  (activeTab === 'thankYou' && isGeneratingThankYou) ||
                  (activeTab === 'cover' && isGeneratingCover) ||
                  (activeTab === 'icon' && isGeneratingIcon)) && (
                     <div className="flex flex-col items-center">
                        <div className={`w-full bg-slate-50 rounded-2xl border-2 border-slate-100 flex items-center justify-center mb-6 relative overflow-hidden
                             ${activeTab === 'banner' ? 'aspect-[2/1]' : 
                               activeTab === 'guide' ? 'aspect-[4/3]' : 
                               activeTab === 'icon' ? 'aspect-square max-w-[200px]' : 
                               'aspect-square max-w-[500px]'}`}
                        >
                             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" style={{ transform: 'skewX(-20deg)' }} />
                             <div className="flex flex-col items-center gap-3 z-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-200 border-t-indigo-600"></div>
                                <span className="text-indigo-600 font-medium">
                                    {activeTab === 'banner' ? t.generatingBannerBtn : 
                                     activeTab === 'guide' ? t.generatingGuideBtn : 
                                     activeTab === 'thankYou' ? t.generatingThankYouBtn :
                                     activeTab === 'cover' ? t.generatingCoverBtn : t.generatingIconBtn}
                                </span>
                             </div>
                        </div>
                    </div>
                )}

                {/* Result State */}
                {((activeTab === 'banner' && bannerImage && !isGeneratingBanner) ||
                  (activeTab === 'guide' && guideImage && !isGeneratingGuide) ||
                  (activeTab === 'thankYou' && thankYouImage && !isGeneratingThankYou) ||
                  (activeTab === 'cover' && coverImage && !isGeneratingCover) ||
                  (activeTab === 'icon' && iconImage && !isGeneratingIcon)) && (
                     <div className="flex flex-col items-center">
                         <div className={`w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-200 mb-6 relative group
                              ${activeTab === 'thankYou' || activeTab === 'cover' ? 'max-w-[500px]' : 
                                activeTab === 'icon' ? 'max-w-[200px]' : ''}`}
                         >
                             {/* Display Logic for Cover/Icon: Show processed version if available (preview bg removal), else raw */}
                            {(activeTab === 'cover' && isProcessingCover) || (activeTab === 'icon' && isProcessingIcon) ? (
                                <div className="absolute inset-0 z-20 bg-white/50 flex items-center justify-center">
                                    <Loader2 className="animate-spin text-indigo-600" size={32} />
                                </div>
                            ) : null}

                            <img 
                                src={activeTab === 'banner' ? bannerImage! : 
                                     activeTab === 'guide' ? guideImage! : 
                                     activeTab === 'thankYou' ? thankYouImage! :
                                     activeTab === 'cover' ? (processedCover || coverImage!) : (processedIcon || iconImage!)} 
                                alt="Generated Result" 
                                className="w-full h-auto relative z-10" 
                            />
                            {/* Checkerboard bg for transparency indication */}
                            <div className="absolute inset-0 z-0" style={checkerboardStyle}></div>
                         </div>
                         
                         {(activeTab === 'cover' || activeTab === 'icon') && (
                            <div className="mb-6 w-full max-w-md bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-start gap-3">
                                <Eraser className="flex-none text-indigo-600 mt-1" size={18} />
                                <div className="text-left text-sm text-indigo-800">
                                    <p className="font-bold mb-1">{t.bgRemovalActive}</p>
                                    <p>{t.bgRemovalActiveDesc}</p>
                                </div>
                            </div>
                         )}

                         {(activeTab === 'cover' || activeTab === 'icon') && (
                            <div className="w-full max-w-md mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                  <NumberControl
                                    label={t.tolerance}
                                    value={config.tolerance}
                                    min={0}
                                    max={50}
                                    onChange={(val) => setConfig({...config, tolerance: val})}
                                    suffix="%"
                                 />
                            </div>
                         )}

                         <div className="flex gap-3">
                            <button
                                onClick={
                                    activeTab === 'banner' ? handleDownloadBanner : 
                                    activeTab === 'guide' ? handleDownloadGuide : 
                                    activeTab === 'thankYou' ? handleDownloadThankYou :
                                    activeTab === 'cover' ? handleDownloadCover : handleDownloadIcon
                                }
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 flex items-center gap-2 transition-transform active:scale-95"
                            >
                                <Download size={20} />
                                {activeTab === 'banner' ? t.downloadBanner : 
                                 activeTab === 'guide' ? t.downloadGuide : 
                                 activeTab === 'thankYou' ? t.downloadThankYou :
                                 activeTab === 'cover' ? t.downloadCover : t.downloadIcon}
                            </button>
                             <button
                                onClick={
                                    activeTab === 'banner' ? onGenerateBanner : 
                                    activeTab === 'guide' ? onGenerateGuide : 
                                    activeTab === 'thankYou' ? onGenerateThankYou :
                                    activeTab === 'cover' ? onGenerateCover : onGenerateIcon
                                }
                                className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 flex items-center gap-2"
                            >
                                <RefreshCw size={18} />
                                {t.reset}
                            </button>
                         </div>
                    </div>
                )}
            </div>
            
            <div className="flex justify-center pt-8">
               <button 
                    onClick={onReset}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <RefreshCw size={14} />
                    <span>{t.reset}</span>
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default EditorSection;
