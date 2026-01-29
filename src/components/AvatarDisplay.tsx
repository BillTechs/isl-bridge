
import React, { useState, useEffect, useRef } from 'react';
import { SignStep } from '../types';
import { generateSignImage } from '../services/geminiService';

interface AvatarDisplayProps {
  steps: SignStep[];
}

const AvatarDisplay: React.FC<AvatarDisplayProps> = ({ steps }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images, setImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(2000); // ms per sign
  const [progress, setProgress] = useState(0);
  
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    async function loadImages() {
      if (steps.length === 0) return;
      setLoading(true);
      const newImages: Record<string, string> = {};
      
      // Load all images in parallel for a seamless sequence
      const promises = steps.map(async (step) => {
        const url = await generateSignImage(step.gloss, step.description);
        if (url) newImages[step.gloss] = url;
      });

      await Promise.all(promises);
      setImages(newImages);
      setLoading(false);
    }
    
    setCurrentIndex(0);
    setIsPlaying(true);
    setProgress(0);
    loadImages();
  }, [steps]);

  useEffect(() => {
    if (steps.length === 0 || loading || !isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    
    const startTime = Date.now();
    timerRef.current = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % steps.length);
    }, speed);
    
    // Smooth progress bar logic
    const progressInterval = setInterval(() => {
      const elapsed = (Date.now() - startTime) % (speed * steps.length);
      const total = speed * steps.length;
      setProgress((elapsed / total) * 100);
    }, 50);
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      clearInterval(progressInterval);
    };
  }, [steps, loading, isPlaying, speed]);

  if (steps.length === 0) {
    return (
      <div className="w-full aspect-square bg-slate-50 rounded-3xl flex flex-col items-center justify-center border-2 border-dashed border-slate-200">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
          <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        </div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Enter English Text to Visualize</p>
      </div>
    );
  }

  const currentStep = steps[currentIndex];
  const currentImageUrl = images[currentStep.gloss];

  return (
    <div className="w-full space-y-6">
      <div className="relative group">
        <div className="relative aspect-square bg-white rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-slate-100">
          {(!currentImageUrl || loading) ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm z-20">
              <div className="relative">
                <div className="animate-ping absolute inset-0 rounded-full bg-emerald-400 opacity-20"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-100 border-t-emerald-600"></div>
              </div>
              <p className="mt-6 text-slate-500 font-black text-xs uppercase tracking-[0.2em] animate-pulse">Neural Rendering...</p>
            </div>
          ) : (
            <div className="relative w-full h-full animate-in fade-in zoom-in-95 duration-500">
              <img 
                key={currentStep.gloss}
                src={currentImageUrl} 
                alt={currentStep.gloss} 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 inset-x-0 h-1.5 bg-slate-100">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-300 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="absolute top-6 right-6 px-4 py-2 bg-black/60 backdrop-blur-md text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">
                {currentIndex + 1} / {steps.length}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Gloss Highlight */}
      <div className="text-center p-6 bg-white rounded-3xl shadow-sm border border-slate-100 min-h-[120px] flex flex-col justify-center">
        <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-2">{currentStep.gloss}</h3>
        <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto italic">"{currentStep.description}"</p>
      </div>

      {/* Timeline Controls */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {steps.map((step, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                idx === currentIndex 
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-100 scale-105' 
                  : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'
              }`}
            >
              {step.gloss}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center justify-center w-14 h-14 rounded-2xl transition-all ${
              isPlaying ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-100 hover:bg-emerald-500'
            }`}
          >
            {isPlaying ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
            ) : (
              <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>

          <div className="flex-1 space-y-2">
            <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span>Transition Delay</span>
              <span>{speed}ms</span>
            </div>
            <input 
              type="range" 
              min="1000" 
              max="4000" 
              step="500" 
              value={speed} 
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarDisplay;
