
import React, { useState } from 'react';
import UploadSection from './components/UploadSection';
import PromptSection from './components/PromptSection';
import EditorSection from './components/EditorSection';
import { AppStep, Language } from './types';
import { DEFAULT_PROMPT_ZH, DEFAULT_PROMPT_EN, TRANSLATIONS, BANNER_PROMPT_PREFIX_ZH, BANNER_PROMPT_SUFFIX_ZH, BANNER_PROMPT_PREFIX_EN, BANNER_PROMPT_SUFFIX_EN } from './constants';
import { generateStickerSheet, generateBanner } from './services/gemini';
import { cropBannerToSize } from './utils/imageProcessing';
import { Camera, Globe } from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<Language>('zh'); // Default to Chinese
  const [prompt, setPrompt] = useState<string>(DEFAULT_PROMPT_ZH);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Banner State
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [isGeneratingBanner, setIsGeneratingBanner] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);

  const t = TRANSLATIONS[language];

  const toggleLanguage = () => {
    const newLang = language === 'zh' ? 'en' : 'zh';
    setLanguage(newLang);
    // Only update prompt if user hasn't started editing heavily or if it's still the default of the other lang
    if (prompt === DEFAULT_PROMPT_ZH || prompt === DEFAULT_PROMPT_EN) {
      setPrompt(newLang === 'zh' ? DEFAULT_PROMPT_ZH : DEFAULT_PROMPT_EN);
    }
  };

  const handleFileSelected = (file: File) => {
    setUploadedFile(file);
    setStep(AppStep.PROMPT);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!uploadedFile) return;

    setStep(AppStep.GENERATING);
    setError(null);
    setBannerImage(null); // Reset banner on new sticker gen

    try {
      const resultBase64 = await generateStickerSheet(uploadedFile, prompt);
      setGeneratedImage(resultBase64);
      setStep(AppStep.EDITING);
    } catch (err: any) {
      console.error(err);
      setError(t.error);
      setStep(AppStep.PROMPT);
    }
  };

  const handleGenerateBanner = async () => {
    if (!uploadedFile) return;
    
    setIsGeneratingBanner(true);
    setBannerError(null);

    try {
        const prefix = language === 'zh' ? BANNER_PROMPT_PREFIX_ZH : BANNER_PROMPT_PREFIX_EN;
        const suffix = language === 'zh' ? BANNER_PROMPT_SUFFIX_ZH : BANNER_PROMPT_SUFFIX_EN;
        const bannerPrompt = `${prefix}\n\nOriginal Request: ${prompt}\n\n${suffix}`;
        
        const rawBanner = await generateBanner(uploadedFile, bannerPrompt);
        const croppedBanner = await cropBannerToSize(rawBanner);
        
        setBannerImage(croppedBanner);
    } catch (err: any) {
        console.error("Banner generation failed", err);
        setBannerError(language === 'zh' ? '生成失败，请重试' : 'Generation failed. Please try again.');
    } finally {
        setIsGeneratingBanner(false);
    }
  };

  const handleReset = () => {
    setStep(AppStep.UPLOAD);
    setUploadedFile(null);
    setGeneratedImage(null);
    setBannerImage(null);
    setPrompt(language === 'zh' ? DEFAULT_PROMPT_ZH : DEFAULT_PROMPT_EN);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/50 pb-20">
      
      {/* Header */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-indigo-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <Camera size={20} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              {t.title}
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <button 
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium transition-colors"
             >
                <Globe size={16} />
                {language === 'zh' ? 'EN' : '中文'}
             </button>
             <div className="hidden sm:block text-sm font-medium text-slate-500">
                {t.subtitle}
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pt-12">
        
        {/* Progress Stepper */}
        <div className="flex justify-center mb-16">
          <div className="flex items-center gap-4">
             {[AppStep.UPLOAD, AppStep.PROMPT, AppStep.EDITING].map((s, idx) => {
               const currentIdx = [AppStep.UPLOAD, AppStep.PROMPT, AppStep.GENERATING, AppStep.EDITING].indexOf(step);
               // Map GENERATING to PROMPT index for visual simplicity
               const stepMap = [AppStep.UPLOAD, AppStep.PROMPT, AppStep.EDITING];
               const activeIdx = step === AppStep.GENERATING ? 1 : stepMap.indexOf(step);
               
               const isCompleted = activeIdx > idx;
               const isCurrent = activeIdx === idx;
               
               return (
                 <div key={s} className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                      isCompleted ? 'bg-indigo-600 text-white' : 
                      isCurrent ? 'bg-white border-2 border-indigo-600 text-indigo-600 shadow-lg shadow-indigo-100' : 'bg-slate-200 text-slate-400'
                    }`}>
                      {idx + 1}
                    </div>
                    {idx < 2 && <div className={`w-12 h-1 rounded-full ${isCompleted ? 'bg-indigo-600' : 'bg-slate-200'}`} />}
                 </div>
               );
             })}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-center">
            {error}
          </div>
        )}

        {/* Views */}
        <div className="transition-all duration-500 ease-in-out">
          {step === AppStep.UPLOAD && (
            <div className="animate-fade-in-up">
               <div className="text-center mb-10">
                 <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
                    {language === 'zh' ? '将你的照片变成表情包' : 'Turn your photos into stickers.'}
                 </h2>
                 <p className="text-lg text-slate-500">
                    {language === 'zh' ? '上传人物照片，自动生成 4x6 表情图。' : 'Upload a character photo, we\'ll generate a 4x6 sticker sheet.'}
                 </p>
               </div>
               <UploadSection onFileSelected={handleFileSelected} lang={language} />
            </div>
          )}

          {(step === AppStep.PROMPT || step === AppStep.GENERATING) && (
            <div className="animate-fade-in-up">
               <PromptSection 
                 prompt={prompt} 
                 setPrompt={setPrompt} 
                 onGenerate={handleGenerate}
                 isGenerating={step === AppStep.GENERATING}
                 previewImage={uploadedFile}
                 lang={language}
               />
            </div>
          )}

          {step === AppStep.EDITING && generatedImage && (
            <div className="animate-fade-in-up">
               <EditorSection 
                 initialImageSrc={generatedImage} 
                 onReset={handleReset}
                 lang={language}
                 onGenerateBanner={handleGenerateBanner}
                 bannerImage={bannerImage}
                 isGeneratingBanner={isGeneratingBanner}
                 bannerError={bannerError}
               />
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default App;
