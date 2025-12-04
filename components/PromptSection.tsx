

import React, { useState } from 'react';
import { Sparkles, ArrowRight, Grid, Film, Image as ImageIcon, FileText, Eye } from 'lucide-react';
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

// Simple internal Markdown Renderer to avoid extra dependencies
const SimpleMarkdownRenderer = ({ content }: { content: string }) => {
  return (
    <div className="w-full h-full p-4 overflow-y-auto text-sm text-slate-700 space-y-2 font-normal">
      {content.split('\n').map((line, i) => {
        const trimmed = line.trim();
        // Handle bolding: **text**
        const parts = line.split(/(\*\*.*?\*\*)/g);
        const renderedLine = parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} className="text-indigo-700 font-bold">{part.slice(2, -2)}</strong>;
          }
          return part;
        });

        // Simple List Rendering
        if (trimmed.match(/^(\d+\.|-|\*)\s/)) {
           return (
             <div key={i} className="flex gap-2 pl-2">
               <span className="text-indigo-400 font-bold select-none">•</span>
               <div>{renderedLine}</div>
             </div>
           );
        }

        if (trimmed === '') return <div key={i} className="h-2" />;

        return <div key={i}>{renderedLine}</div>;
      })}
    </div>
  );
};

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
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('preview'); // Default to preview for nicer look

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
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-100">
          <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 bg-slate-50/50">
             <label className="text-sm font-semibold text-slate-700">
                {mode === AppMode.GIF ? t.promptLabel + " (Auto-Generated)" : t.promptLabel}
             </label>
             <div className="flex bg-slate-200 rounded-lg p-0.5">
                <button 
                  onClick={() => setViewMode('edit')}
                  disabled={mode === AppMode.GIF}
                  className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-all ${viewMode === 'edit' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'} ${mode === AppMode.GIF ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <FileText size={12} /> {t.editPrompt}
                </button>
                <button 
                  onClick={() => setViewMode('preview')}
                  className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-all ${viewMode === 'preview' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Eye size={12} /> {t.previewPrompt}
                </button>
             </div>
          </div>
          
          <div className="relative h-60 bg-slate-50/30">
            {viewMode === 'edit' && mode !== AppMode.GIF ? (
              <textarea
                className="w-full h-full p-4 border-none outline-none resize-none text-slate-700 leading-relaxed text-sm bg-transparent font-mono"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t.promptPlaceholder}
              />
            ) : (
              <SimpleMarkdownRenderer content={prompt} />
            )}
            
            {/* Read-only overlay for GIF mode if needed, though viewMode switch handles most of it */}
            {mode === AppMode.GIF && viewMode === 'edit' && (
                <div className="absolute inset-0 bg-slate-50/50 flex items-center justify-center text-slate-400 text-sm">
                   Preview Only
                </div>
            )}
          </div>
          
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex justify-end">
             <p className="text-xs text-slate-400">
                {t.model}
             </p>
          </div>
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