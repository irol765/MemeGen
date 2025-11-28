import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { Language } from '../types';

interface UploadSectionProps {
  onFileSelected: (file: File) => void;
  lang: Language;
}

const UploadSection: React.FC<UploadSectionProps> = ({ onFileSelected, lang }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = TRANSLATIONS[lang];

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelected(e.target.files[0]);
    }
  };

  return (
    <div 
      className="w-full max-w-2xl mx-auto p-12 bg-white rounded-3xl shadow-xl border-2 border-dashed border-indigo-100 hover:border-indigo-400 transition-colors cursor-pointer flex flex-col items-center justify-center text-center group"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => fileInputRef.current?.click()}
    >
      <div className="bg-indigo-50 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
        <Upload className="w-12 h-12 text-indigo-600" />
      </div>
      <h3 className="text-2xl font-bold text-slate-800 mb-2">{t.uploadTitle}</h3>
      <p className="text-slate-500 mb-8">{t.uploadDesc}</p>
      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleChange} 
        accept="image/*"
      />
      <div className="flex gap-4">
        <span className="text-xs px-3 py-1 bg-slate-100 rounded-full text-slate-500">JPG</span>
        <span className="text-xs px-3 py-1 bg-slate-100 rounded-full text-slate-500">PNG</span>
        <span className="text-xs px-3 py-1 bg-slate-100 rounded-full text-slate-500">WEBP</span>
      </div>
    </div>
  );
};

export default UploadSection;
