

import React, { useState, useEffect } from 'react';
import { X, Save, AlertTriangle } from 'lucide-react';
import { AppSettings, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  hasEnvKey: boolean;
  lang: Language;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave, hasEnvKey, lang }) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    setFormData(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">{t.settingsTitle}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Warning if no key */}
          {!hasEnvKey && !formData.apiKey && (
             <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="text-amber-600 flex-none" size={20} />
                <div className="text-sm text-amber-800">
                  <p className="font-bold">{t.apiKeyRequired}</p>
                  <p>{t.apiKeyRequiredDesc}</p>
                </div>
             </div>
          )}

          {/* API Key */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
               {t.apiKeyLabel}
            </label>
            <input
              type="password"
              value={formData.apiKey}
              onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
              placeholder="sk-..."
              className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 bg-slate-50 font-mono text-sm"
              required={!hasEnvKey}
            />
            <p className="text-xs text-slate-400 mt-1">
              {t.apiKeyNote}
            </p>
          </div>

          {/* Base URL */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
               {t.baseUrlLabel}
            </label>
            <input
              type="text"
              value={formData.baseUrl}
              onChange={(e) => setFormData({...formData, baseUrl: e.target.value})}
              placeholder={t.baseUrlPlaceholder}
              className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 bg-slate-50 font-mono text-sm"
            />
            <p className="text-xs text-slate-400 mt-1">
              {t.baseUrlNote}
            </p>
          </div>

          {/* OpenAI Format Toggle */}
          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
             <div>
                <p className="font-semibold text-slate-700 text-sm">{t.proxyLabel}</p>
                <p className="text-xs text-slate-500 mt-1">
                   {t.proxyNote}
                </p>
             </div>
             <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.useOpenAIFormat}
                  onChange={(e) => setFormData({...formData, useOpenAIFormat: e.target.checked})}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
             </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center gap-2 transition-transform active:scale-95"
            >
              <Save size={18} />
              {t.saveSettings}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default SettingsModal;