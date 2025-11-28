import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { Language } from '../types';

interface PromptSectionProps {
  prompt: string;
  setPrompt: (s: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  previewImage: File | null;
  lang: Language;
}

const PromptSection: React.FC<PromptSectionProps> = ({ 
  prompt, 
  setPrompt, 
  onGenerate, 
  isGenerating,
  previewImage,
  lang
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
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            {t.promptLabel}
          </label>
          <textarea
            className="w-full h-40 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none text-slate-700 leading-relaxed text-sm bg-slate-50"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t.promptPlaceholder}
          />
          <p className="text-xs text-slate-400 mt-2 text-right">
             {t.model}
          </p>
        </div>

        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-xl flex items-center justify-center gap-3 transition-all ${
            isGenerating 
              ? 'bg-slate-400 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/30 active:scale-[0.99]'
          }`}
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              {t.generatingBtn}
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              {t.generateBtn}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PromptSection;
