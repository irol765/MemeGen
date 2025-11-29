



import React, { useState, useEffect } from 'react';
import UploadSection from './components/UploadSection';
import PromptSection from './components/PromptSection';
import EditorSection from './components/EditorSection';
import { AppStep, Language, AppMode } from './types';
import { 
    DEFAULT_PROMPT_ZH, 
    DEFAULT_PROMPT_EN, 
    GIF_PROMPT_TEMPLATE_ZH,
    GIF_PROMPT_TEMPLATE_EN,
    TRANSLATIONS, 
    BANNER_PROMPT_PREFIX_ZH, 
    BANNER_PROMPT_SUFFIX_ZH, 
    BANNER_PROMPT_PREFIX_EN, 
    BANNER_PROMPT_SUFFIX_EN,
    GUIDE_PROMPT_PREFIX_ZH,
    GUIDE_PROMPT_SUFFIX_ZH,
    GUIDE_PROMPT_PREFIX_EN,
    GUIDE_PROMPT_SUFFIX_EN,
    THANKYOU_PROMPT_PREFIX_ZH,
    THANKYOU_PROMPT_SUFFIX_ZH,
    THANKYOU_PROMPT_PREFIX_EN,
    THANKYOU_PROMPT_SUFFIX_EN
} from './constants';
import { generateStickerSheet, generateBanner, generateDonationGuide, generateDonationThankYou } from './services/gemini';
import { cropBannerToSize, cropGuideToSize, cropThankYouToSize } from './utils/imageProcessing';
import { Camera, Globe, Lock, ArrowRight } from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);
  const [mode, setMode] = useState<AppMode>(AppMode.STICKERS);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<Language>('zh'); // Default to Chinese
  
  // Auth State
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Prompt State
  const [prompt, setPrompt] = useState<string>(DEFAULT_PROMPT_ZH);
  const [actionText, setActionText] = useState<string>('');
  
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Banner State
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [isGeneratingBanner, setIsGeneratingBanner] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);

  // Donation Guide State
  const [guideImage, setGuideImage] = useState<string | null>(null);
  const [isGeneratingGuide, setIsGeneratingGuide] = useState(false);
  const [guideError, setGuideError] = useState<string | null>(null);

  // Thank You Image State
  const [thankYouImage, setThankYouImage] = useState<string | null>(null);
  const [isGeneratingThankYou, setIsGeneratingThankYou] = useState(false);
  const [thankYouError, setThankYouError] = useState<string | null>(null);

  const t = TRANSLATIONS[language];

  // Check auth on load
  useEffect(() => {
     const envCode = process.env.ACCESS_CODE;
     // If no access code is set in environment, auto-authorize
     if (!envCode) {
         setIsAuthorized(true);
     }
  }, []);

  const handleAuthSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (accessCodeInput === process.env.ACCESS_CODE) {
          setIsAuthorized(true);
          setAuthError(null);
      } else {
          setAuthError(t.authError);
      }
  };

  // Update prompt when language or mode changes
  useEffect(() => {
    if (mode === AppMode.STICKERS) {
        // Only reset prompt if it's currently a default
        if (prompt === DEFAULT_PROMPT_ZH || prompt === DEFAULT_PROMPT_EN || prompt.includes("{action}")) {
            setPrompt(language === 'zh' ? DEFAULT_PROMPT_ZH : DEFAULT_PROMPT_EN);
        }
    } else {
        // GIF Mode: Use Template
        const template = language === 'zh' ? GIF_PROMPT_TEMPLATE_ZH : GIF_PROMPT_TEMPLATE_EN;
        const filledPrompt = template.split("{action}").join(actionText || (language === 'zh' ? '...' : '...'));
        setPrompt(filledPrompt);
    }
  }, [language, mode]);

  // Update prompt dynamically when action text changes in GIF mode
  useEffect(() => {
      if (mode === AppMode.GIF) {
          const template = language === 'zh' ? GIF_PROMPT_TEMPLATE_ZH : GIF_PROMPT_TEMPLATE_EN;
          // If action is empty, just show placeholders to avoid confusion in preview, but validation blocks generation
          const displayAction = actionText || (language === 'zh' ? '指定动作' : 'ACTION');
          const filledPrompt = template.split("{action}").join(displayAction);
          setPrompt(filledPrompt);
      }
  }, [actionText, language, mode]);


  const toggleLanguage = () => {
    const newLang = language === 'zh' ? 'en' : 'zh';
    setLanguage(newLang);
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
    setGuideImage(null);
    setThankYouImage(null);

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

  const handleSkip = () => {
    if (!uploadedFile) return;
    setBannerImage(null);
    setGuideImage(null);
    setThankYouImage(null);
    setError(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
        if (e.target?.result) {
            setGeneratedImage(e.target.result as string);
            setStep(AppStep.EDITING);
        }
    };
    reader.readAsDataURL(uploadedFile);
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

  const handleGenerateGuide = async () => {
    if (!uploadedFile) return;
    
    setIsGeneratingGuide(true);
    setGuideError(null);

    try {
        const prefix = language === 'zh' ? GUIDE_PROMPT_PREFIX_ZH : GUIDE_PROMPT_PREFIX_EN;
        const suffix = language === 'zh' ? GUIDE_PROMPT_SUFFIX_ZH : GUIDE_PROMPT_SUFFIX_EN;
        const guidePrompt = `${prefix}\n\nOriginal Request: ${prompt}\n\n${suffix}`;
        
        const rawGuide = await generateDonationGuide(uploadedFile, guidePrompt);
        const croppedGuide = await cropGuideToSize(rawGuide);
        
        setGuideImage(croppedGuide);
    } catch (err: any) {
        console.error("Guide generation failed", err);
        setGuideError(language === 'zh' ? '生成失败，请重试' : 'Generation failed. Please try again.');
    } finally {
        setIsGeneratingGuide(false);
    }
  };

  const handleGenerateThankYou = async () => {
    if (!uploadedFile) return;
    
    setIsGeneratingThankYou(true);
    setThankYouError(null);

    try {
        const prefix = language === 'zh' ? THANKYOU_PROMPT_PREFIX_ZH : THANKYOU_PROMPT_PREFIX_EN;
        const suffix = language === 'zh' ? THANKYOU_PROMPT_SUFFIX_ZH : THANKYOU_PROMPT_SUFFIX_EN;
        const thankYouPrompt = `${prefix}\n\nOriginal Request: ${prompt}\n\n${suffix}`;
        
        const rawThankYou = await generateDonationThankYou(uploadedFile, thankYouPrompt);
        const croppedThankYou = await cropThankYouToSize(rawThankYou);
        
        setThankYouImage(croppedThankYou);
    } catch (err: any) {
        console.error("Thank You generation failed", err);
        setThankYouError(language === 'zh' ? '生成失败，请重试' : 'Generation failed. Please try again.');
    } finally {
        setIsGeneratingThankYou(false);
    }
  };

  const handleReset = () => {
    setStep(AppStep.UPLOAD);
    setUploadedFile(null);
    setGeneratedImage(null);
    setBannerImage(null);
    setGuideImage(null);
    setThankYouImage(null);
    setMode(AppMode.STICKERS);
    setActionText('');
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
        
        {!isAuthorized ? (
            <div className="min-h-[60vh] flex items-center justify-center animate-fade-in-up">
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-indigo-100 w-full max-w-md text-center">
                    <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">{t.authTitle}</h2>
                    <p className="text-slate-500 mb-8">{t.authDesc}</p>
                    
                    <form onSubmit={handleAuthSubmit} className="space-y-4">
                        <input
                            type="password"
                            value={accessCodeInput}
                            onChange={(e) => setAccessCodeInput(e.target.value)}
                            placeholder={t.authPlaceholder}
                            className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-center text-lg"
                            autoFocus
                        />
                        {authError && (
                            <p className="text-red-500 text-sm font-medium animate-pulse">
                                {authError}
                            </p>
                        )}
                        <button
                            type="submit"
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-transform active:scale-95"
                        >
                            {t.authButton}
                            <ArrowRight size={20} />
                        </button>
                    </form>
                </div>
            </div>
        ) : (
            <>
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
                            {language === 'zh' ? '上传人物照片，自动生成静态切片或 GIF 动画。' : 'Upload a character photo, generate sticker sheets or animated GIFs.'}
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
                         onSkip={handleSkip}
                         isGenerating={step === AppStep.GENERATING}
                         previewImage={uploadedFile}
                         lang={language}
                         mode={mode}
                         setMode={setMode}
                         actionText={actionText}
                         setActionText={setActionText}
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
        
                         onGenerateGuide={handleGenerateGuide}
                         guideImage={guideImage}
                         isGeneratingGuide={isGeneratingGuide}
                         guideError={guideError}
        
                         onGenerateThankYou={handleGenerateThankYou}
                         thankYouImage={thankYouImage}
                         isGeneratingThankYou={isGeneratingThankYou}
                         thankYouError={thankYouError}
        
                         mode={mode}
                       />
                    </div>
                  )}
                </div>
            </>
        )}

      </main>
    </div>
  );
};

export default App;