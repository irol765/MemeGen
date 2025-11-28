
import React, { useState, useEffect } from 'react';
import { GridConfig, StickerSlice, Language } from '../types';
import { removeBackground, sliceImageToBlobs, createAndDownloadZip } from '../utils/imageProcessing';
import { Download, Grid, Layers, Eraser, RefreshCw, Move, Image as ImageIcon, Sparkles } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface EditorSectionProps {
  initialImageSrc: string;
  onReset: () => void;
  lang: Language;
  onGenerateBanner: () => void;
  bannerImage: string | null;
  isGeneratingBanner: boolean;
  bannerError: string | null;
}

const EditorSection: React.FC<EditorSectionProps> = ({ 
  initialImageSrc, 
  onReset, 
  lang,
  onGenerateBanner,
  bannerImage,
  isGeneratingBanner,
  bannerError
}) => {
  const [activeTab, setActiveTab] = useState<'stickers' | 'banner'>('stickers');

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
  const t = TRANSLATIONS[lang];
  
  // Debounce effect for background removal (Stickers only)
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const result = await removeBackground(initialImageSrc, config.tolerance);
        setProcessedImage(result);
      } catch (e) {
        console.error("BG Removal failed", e);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [initialImageSrc, config.tolerance]);

  // Effect to re-slice when grid or processed image changes (Stickers only)
  useEffect(() => {
    const doSlice = async () => {
      setIsProcessing(true);
      try {
        const newSlices = await sliceImageToBlobs(processedImage, config);
        setSlices(newSlices);
      } catch (e) {
        console.error("Slicing failed", e);
      } finally {
        setIsProcessing(false);
      }
    };
    doSlice();
  }, [processedImage, config.rows, config.cols, config.padding, config.offsetX, config.offsetY]);

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

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 inline-flex">
          <button
            onClick={() => setActiveTab('stickers')}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'stickers' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Grid size={18} />
            {t.tabStickers}
          </button>
          <button
            onClick={() => setActiveTab('banner')}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'banner' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <ImageIcon size={18} />
            {t.tabBanner}
          </button>
        </div>
      </div>
      
      {activeTab === 'stickers' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start animate-fade-in-up">
          {/* Left Column: Visual Editor & Large Preview */}
          <div className="space-y-8">
              {/* 1. Main Visual Editor */}
              <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-200 relative group select-none">
                  {/* Image Container - fits content exactly */}
                  <div className="relative w-full" style={checkerboardStyle}>
                      <img 
                          src={processedImage} 
                          alt="Generated Sticker Sheet" 
                          className="w-full h-auto block"
                      />
                      
                      {/* Visual Grid Overlay */}
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
                                  {/* The Cut Box - Moves according to offset */}
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
                  
                  <div className="absolute top-4 right-4 bg-white/80 text-slate-700 text-xs font-bold px-2 py-1 rounded backdrop-blur shadow-sm border border-slate-200">
                      {t.generated}
                  </div>
              </div>

              {/* 2. Large Preview Slices */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                  <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                          <Layers size={20} />
                      </div>
                      <h3 className="font-bold text-slate-800">{t.preview} ({slices.length})</h3>
                  </div>
                  {/* Responsive grid to fill the area */}
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3 p-4 bg-slate-50 rounded-xl min-h-[200px] max-h-[600px] overflow-y-auto custom-scrollbar">
                      {slices.map((slice) => (
                          <div key={slice.id} className="aspect-square bg-white rounded border border-slate-200 overflow-hidden flex items-center justify-center shadow-sm relative group hover:ring-2 ring-indigo-500 transition-all">
                              <img src={slice.previewUrl} className="max-w-full max-h-full" alt="slice" />
                              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                          </div>
                      ))}
                  </div>
              </div>
          </div>

          {/* Right Column: Controls */}
          <div className="space-y-6 lg:sticky lg:top-24">
              
              {/* Background Removal Control */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                  <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                          <Eraser size={20} />
                      </div>
                      <h3 className="font-bold text-slate-800">{t.bgRemoval}</h3>
                  </div>
                  <div className="space-y-4">
                       <div>
                          <div className="flex justify-between text-sm mb-2">
                              <span className="text-slate-600">{t.tolerance}</span>
                              <span className="font-mono text-indigo-600">{config.tolerance}%</span>
                          </div>
                          <input 
                              type="range" 
                              min="0" 
                              max="50" 
                              value={config.tolerance}
                              onChange={(e) => setConfig({...config, tolerance: Number(e.target.value)})}
                              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                       </div>
                       <p className="text-xs text-slate-400">
                          {t.bgDesc}
                       </p>
                  </div>
              </div>

              {/* Grid & Layout Control */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                  <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                          <Grid size={20} />
                      </div>
                      <h3 className="font-bold text-slate-800">{t.grid}</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
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
                   <div>
                      <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-600">{t.padding}</span>
                          <span className="font-mono text-indigo-600">{config.padding}%</span>
                      </div>
                      <input 
                          type="range" 
                          min="0" 
                          max="40" 
                          value={config.padding}
                          onChange={(e) => setConfig({...config, padding: Number(e.target.value)})}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                   </div>
              </div>

              {/* Offset Control */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                  <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                          <Move size={20} />
                      </div>
                      <h3 className="font-bold text-slate-800">{t.offset}</h3>
                  </div>

                  <div className="space-y-4">
                      <div>
                          <div className="flex justify-between text-sm mb-2">
                              <span className="text-slate-600">{t.horizontal} (X)</span>
                              <span className="font-mono text-indigo-600">{config.offsetX}%</span>
                          </div>
                          <input 
                              type="range" 
                              min="-40" 
                              max="40" 
                              value={config.offsetX}
                              onChange={(e) => setConfig({...config, offsetX: Number(e.target.value)})}
                              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                      </div>
                      <div>
                          <div className="flex justify-between text-sm mb-2">
                              <span className="text-slate-600">{t.vertical} (Y)</span>
                              <span className="font-mono text-indigo-600">{config.offsetY}%</span>
                          </div>
                          <input 
                              type="range" 
                              min="-40" 
                              max="40" 
                              value={config.offsetY}
                              onChange={(e) => setConfig({...config, offsetY: Number(e.target.value)})}
                              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                      </div>
                  </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                  <button 
                      onClick={handleDownloadStickers}
                      disabled={isProcessing}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 transition-transform active:scale-95"
                  >
                      <Download size={20} />
                      {t.download}
                  </button>
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

      {activeTab === 'banner' && (
        <div className="max-w-4xl mx-auto animate-fade-in-up space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 text-center">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">{t.bannerTitle}</h3>
                <p className="text-slate-500 mb-8 max-w-lg mx-auto">{t.bannerDesc}</p>

                {bannerError && (
                    <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                        {bannerError}
                    </div>
                )}

                {!bannerImage && !isGeneratingBanner && (
                    <div className="flex flex-col items-center">
                        <div className="w-full aspect-[2/1] bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center mb-6">
                            <p className="text-slate-400 font-medium">{t.bannerEmpty}</p>
                        </div>
                        <button
                            onClick={onGenerateBanner}
                            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 flex items-center gap-2 transition-transform active:scale-95"
                        >
                            <Sparkles size={20} />
                            {t.generateBannerBtn}
                        </button>
                    </div>
                )}

                {isGeneratingBanner && (
                     <div className="flex flex-col items-center">
                        <div className="w-full aspect-[2/1] bg-slate-50 rounded-2xl border-2 border-slate-100 flex items-center justify-center mb-6 relative overflow-hidden">
                             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" style={{ transform: 'skewX(-20deg)' }} />
                             <div className="flex flex-col items-center gap-3 z-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-200 border-t-indigo-600"></div>
                                <span className="text-indigo-600 font-medium">{t.generatingBannerBtn}</span>
                             </div>
                        </div>
                    </div>
                )}

                {bannerImage && !isGeneratingBanner && (
                     <div className="flex flex-col items-center">
                         <div className="w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-200 mb-6 relative group">
                            <img src={bannerImage} alt="WeChat Banner" className="w-full h-auto" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                         </div>
                         <div className="flex gap-3">
                            <button
                                onClick={handleDownloadBanner}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 flex items-center gap-2 transition-transform active:scale-95"
                            >
                                <Download size={20} />
                                {t.downloadBanner}
                            </button>
                             <button
                                onClick={onGenerateBanner}
                                className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 flex items-center gap-2"
                            >
                                <RefreshCw size={18} />
                                {t.reset}
                            </button>
                         </div>
                    </div>
                )}
            </div>
            
            {/* Nav Back Actions */}
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
