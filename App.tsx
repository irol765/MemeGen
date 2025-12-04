

import React, { useState, useEffect } from 'react';
import UploadSection from './components/UploadSection';
import PromptSection from './components/PromptSection';
import EditorSection from './components/EditorSection';
import SettingsModal from './components/SettingsModal';
import { AppStep, Language, AppMode, AppSettings } from './types';
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
    THANKYOU_PROMPT_SUFFIX_EN,
    COVER_PROMPT_PREFIX_ZH,
    COVER_PROMPT_SUFFIX_ZH,
    COVER_PROMPT_PREFIX_EN,
    COVER_PROMPT_SUFFIX_EN,
    ICON_PROMPT_PREFIX_ZH,
    ICON_PROMPT_SUFFIX_ZH,
    ICON_PROMPT_PREFIX_EN,
    ICON_PROMPT_SUFFIX_EN
} from './constants';
import { generateStickerSheet, generateBanner, generateDonationGuide, generateDonationThankYou, generateStickerCover, generateStickerIcon } from './services/gemini';
import { cropBannerToSize, cropGuideToSize, cropThankYouToSize } from './utils/imageProcessing';
import { Camera, Globe, Lock, ArrowRight, Github, Settings as SettingsIcon } from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);
  const [mode, setMode] = useState<AppMode>(AppMode.STICKERS);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<Language>('zh'); // Default to Chinese
  
  // Auth State
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Settings State
  const [settings, setSettings] = useState<AppSettings>({
    apiKey: '',
    baseUrl: '',
    useOpenAIFormat: false
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
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

  // Cover Image State
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);

  // Icon Image State
  const [iconImage, setIconImage] = useState<string | null>(null);
  const [isGeneratingIcon, setIsGeneratingIcon] = useState(false);
  const [iconError, setIconError] = useState<string | null>(null);

  const t = TRANSLATIONS[language];
  const hasEnvKey = !!process.env.API_KEY && process.env.API_KEY !== '""';

  // Load Settings from LocalStorage
  useEffect(() => {
     const stored = localStorage.getItem('memegen_settings');
     if (stored) {
         try {
             setSettings(JSON.parse(stored));
         } catch (e) {
             console.error("Failed to parse settings", e);
         }
     }
  }, []);

  // Check auth on load
  useEffect(() => {
     const envCode = process.env.ACCESS_CODE;
     // If no access code is set in environment, auto-authorize
     if (!envCode) {
         setIsAuthorized(true);
     }
  }, []);

  // Auto-open settings if no key is found
  useEffect(() => {
      // Small delay to ensure localStorage load finished
      const timer = setTimeout(() => {
          if (!hasEnvKey && !settings.apiKey && !isAuthorized && !process.env.ACCESS_CODE) {
              // Only prompt if not locked by auth code (if locked, user deals with auth first)
              setIsSettingsOpen(true);
          } else if (!hasEnvKey && !settings.apiKey && isAuthorized) {
              setIsSettingsOpen(true);
          }
      }, 500);
      return () => clearTimeout(timer);
  }, [hasEnvKey, settings.apiKey, isAuthorized]);

  const handleSaveSettings = (newSettings: AppSettings) => {
      setSettings(newSettings);
      localStorage.setItem('memegen_settings', JSON.stringify(newSettings));
  };

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

    // Check key before generating
    if (!hasEnvKey && !settings.apiKey) {
        setIsSettingsOpen(true);
        return;
    }

    setStep(AppStep.GENERATING);
    setError(null);
    setBannerImage(null); // Reset banner on new sticker gen
    setGuideImage(null);
    setThankYouImage(null);
    setCoverImage(null);
    setIconImage(null);

    try {
      const resultBase64 = await generateStickerSheet(uploadedFile, prompt, settings);
      setGeneratedImage(resultBase64);
      setStep(AppStep.EDITING);
    } catch (err: any) {
      console.error(err);
      setError(`${t.error} ${err.message || ''}`);
      setStep(AppStep.PROMPT);
    }
  };

  const handleSkip = () => {
    if (!uploadedFile) return;
    setBannerImage(null);
    setGuideImage(null);
    setThankYouImage(null);
    setCoverImage(null);
    setIconImage(null);
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
        
        const rawBanner = await generateBanner(uploadedFile, bannerPrompt, settings);
        const croppedBanner = await cropBannerToSize(rawBanner);
        
        setBannerImage(croppedBanner);
    } catch (err: any) {
        console.error("Banner generation failed", err);
        setBannerError(`${language === 'zh' ? '生成失败' : 'Generation failed'}: ${err.message || ''}`);
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
        
        const rawGuide = await generateDonationGuide(uploadedFile, guidePrompt, settings);
        const croppedGuide = await cropGuideToSize(rawGuide);
        
        setGuideImage(croppedGuide);
    } catch (err: any) {
        console.error("Guide generation failed", err);
        setGuideError(`${language === 'zh' ? '生成失败' : 'Generation failed'}: ${err.message || ''}`);
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
        
        const rawThankYou = await generateDonationThankYou(uploadedFile, thankYouPrompt, settings);
        const croppedThankYou = await cropThankYouToSize(rawThankYou);
        
        setThankYouImage(croppedThankYou);
    } catch (err: any) {
        console.error("Thank You generation failed", err);
        setThankYouError(`${language === 'zh' ? '生成失败' : 'Generation failed'}: ${err.message || ''}`);
    } finally {
        setIsGeneratingThankYou(false);
    }
  };

  const handleGenerateCover = async () => {
    if (!uploadedFile) return;
    
    setIsGeneratingCover(true);
    setCoverError(null);

    try {
        const prefix = language === 'zh' ? COVER_PROMPT_PREFIX_ZH : COVER_PROMPT_PREFIX_EN;
        const suffix = language === 'zh' ? COVER_PROMPT_SUFFIX_ZH : COVER_PROMPT_SUFFIX_EN;
        const coverPrompt = `${prefix}\n\nOriginal Request: ${prompt}\n\n${suffix}`;
        
        const rawCover = await generateStickerCover(uploadedFile, coverPrompt, settings);
        // Do NOT crop yet. We keep it high res for better bg removal in EditorSection.
        setCoverImage(rawCover);
    } catch (err: any) {
        console.error("Cover generation failed", err);
        setCoverError(`${language === 'zh' ? '生成失败' : 'Generation failed'}: ${err.message || ''}`);
    } finally {
        setIsGeneratingCover(false);
    }
  };

  const handleGenerateIcon = async () => {
    if (!uploadedFile) return;
    
    setIsGeneratingIcon(true);
    setIconError(null);

    try {
        const prefix = language === 'zh' ? ICON_PROMPT_PREFIX_ZH : ICON_PROMPT_PREFIX_EN;
        const suffix = language === 'zh' ? ICON_PROMPT_SUFFIX_ZH : ICON_PROMPT_SUFFIX_EN;
        const iconPrompt = `${prefix}\n\nOriginal Request: ${prompt}\n\n${suffix}`;
        
        const rawIcon = await generateStickerIcon(uploadedFile, iconPrompt, settings);
        // Do NOT crop yet. We keep it high res for better bg removal in EditorSection.
        setIconImage(rawIcon);
    } catch (err: any) {
        console.error("Icon generation failed", err);
        setIconError(`${language === 'zh' ? '生成失败' : 'Generation failed'}: ${err.message || ''}`);
    } finally {
        setIsGeneratingIcon(false);
    }
  };

  const handleReset = () => {
    setStep(AppStep.UPLOAD);
    setUploadedFile(null);
    setGeneratedImage(null);
    setBannerImage(null);
    setGuideImage(null);
    setThankYouImage(null);
    setCoverImage(null);
    setIconImage(null);
    setMode(AppMode.STICKERS);
    setActionText('');
    setPrompt(language === 'zh' ? DEFAULT_PROMPT_ZH : DEFAULT_PROMPT_EN);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/50 flex flex-col">
      
      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        settings={settings}
        onSave={handleSaveSettings}
        hasEnvKey={hasEnvKey}
        lang={language}
      />

      {/* Header */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-indigo-100 sticky top-0 z-50 flex-none">
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
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-all"
                title="Settings"
             >
                <SettingsIcon size={20} />
             </button>
             <a 
                href="https://github.com/irol765/MemeGen" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-indigo-600 transition-colors p-1"
                title="View on GitHub"
             >
                <Github size={20} />
             </a>
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
      <main className="max-w-7xl mx-auto px-6 pt-12 flex-grow w-full">
        
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
                  <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-center break-words">
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

                         onGenerateCover={handleGenerateCover}
                         coverImage={coverImage}
                         isGeneratingCover={isGeneratingCover}
                         coverError={coverError}

                         onGenerateIcon={handleGenerateIcon}
                         iconImage={iconImage}
                         isGeneratingIcon={isGeneratingIcon}
                         iconError={iconError}
        
                         mode={mode}
                       />
                    </div>
                  )}
                </div>
            </>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full py-6 mt-12 border-t border-indigo-100/50 bg-white/40 backdrop-blur-sm flex-none">
          <div className="max-w-7xl mx-auto px-6 flex flex-col items-center justify-center gap-2 text-slate-400 text-sm">
             <p>© {new Date().getFullYear()} irol765. All rights reserved.</p>
             <a href="https://github.com/irol765/MemeGen" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
                <Github size={14} />
                <span>GitHub</span>
             </a>
          </div>
      </footer>
    </div>
  );
};

export default App;