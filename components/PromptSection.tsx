

import React from 'react';
import { Sparkles, ArrowRight, Grid, Film, Image as ImageIcon } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { Language, AppMode } from '../types';

interface PromptSectionProps {
  prompt: string;
  setPrompt: (s: string) => void;
  onGenerate: () => void;
  onSkip: () => void;
  isGenerating: boolean;
  previewImage: File | null;
  lang: Language;
  mode: AppMode;
  setMode: (m: AppMode) => void;
  actionText: string;
  setActionText: (s: string) => void;
}

const PromptSection: React.FC<PromptSectionProps> = ({ 
  prompt, 
  setPrompt, 
  onGenerate, 
  onSkip,
  isGenerating,
  previewImage,
  lang,
  mode,
  setMode,
  actionText,
  setActionText
}) => {
  const previewUrl = previewImage ? URL.createObjectURL(previewImage) : '';
  const t = TRANSLATIONS[lang];

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
      {/* Left: Preview */}
      <div className="md:col-span-1 bg-white p-4 rounded-2xl shadow-lg">
        <div className="aspect-[3/4] w-full rounded-xl overflow-hidden bg-slate-100 relative">
          {previewUrl && (
            <img 
              src={previewUrl} 
              alt="Uploaded preview" 
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <p className="text-center text-sm text-slate-400 mt-2">{t.original}</p>
      </div>

      {/* Right: Controls */}
      <div className="md:col-span-2 space-y-6">
        
        {/* Mode Selector */}
        <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200 flex gap-2">
            <button
                onClick={() => setMode(AppMode.STICKERS)}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                    mode === AppMode.STICKERS 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
            >
                <Grid size={18} />
                {t.modeSticker}
            </button>
            <button
                onClick={() => setMode(AppMode.GIF)}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                    mode === AppMode.GIF 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
            >
                <Film size={18} />
                {t.modeGif}
            </button>
        </div>

        {/* Action Input (GIF Mode Only) */}
        {mode === AppMode.GIF && (
           <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100 animate-fade-in-up">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                {t.actionLabel}
              </label>
              <input
                type="text"
                className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-slate-700 bg-slate-50 font-medium"
                value={actionText}
                onChange={(e) => setActionText(e.target.value)}
                placeholder={t.actionPlaceholder}
              />
           </div>
        )}

        {/* Prompt Area */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            {mode === AppMode.GIF ? t.promptLabel + " (Auto-Generated)" : t.promptLabel}
          </label>
          <textarea
            className={`w-full h-40 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none text-slate-700 leading-relaxed text-sm bg-slate-50 ${mode === AppMode.GIF ? 'opacity-70' : ''}`}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t.promptPlaceholder}
            readOnly={mode === AppMode.GIF} // Readonly in GIF mode as it is templated
          />
          <p className="text-xs text-slate-400 mt-2 text-right">
             {t.model}
          </p>
        </div>

        <div className="flex flex-col gap-3">
             <button
              onClick={onGenerate}
              disabled={isGenerating || (mode === AppMode.GIF && !actionText.trim())}
              className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-xl flex items-center justify-center gap-3 transition-all ${
                isGenerating || (mode === AppMode.GIF && !actionText.trim())
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/30 active:scale-[0.99]'
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  {mode === AppMode.GIF ? t.generatingGifBtn : t.generatingBtn}
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  {mode === AppMode.GIF ? t.generateGifBtn : t.generateBtn}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            
            <div className="relative pt-2">
                 <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-slate-200"></div>
                 </div>
                 <div className="relative flex justify-center">
                    <span className="bg-slate-50 px-2 text-xs text-slate-400 uppercase">Or</span>
                 </div>
            </div>

            <button
                onClick={onSkip}
                className="w-full py-3 rounded-xl font-bold text-slate-600 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 flex items-center justify-center gap-2 transition-all shadow-sm"
            >
                <ImageIcon size={20} />
                {t.skipBtn}
            </button>
             <p className="text-xs text-center text-slate-400">{t.skipBtnDesc}</p>
        </div>
      </div>
    </div>
  );
};

export default PromptSection;
