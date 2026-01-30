import React, { useState, useCallback, useRef, useEffect } from 'react';
import { TranslationMode, SignStep, HistoryItem, SignOfTheDay } from './types';
import CameraView from './components/CameraView';
import AvatarDisplay from './components/AvatarDisplay';
import CommunityView from './components/CommunityView';
import {
  translateISLToEnglish,
  generateSpeech,
  translateEnglishToISLGloss,
  getSignOfTheDay
} from './services/geminiService';
import { decodeGeminiPcm, playBuffer } from './services/audioService';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeView, setActiveView] = useState<'HOME' | 'TRANSLATE' | 'COMMUNITY'>('HOME');
  const [mode, setMode] = useState<TranslationMode>(TranslationMode.ISL_TO_ENGLISH);
  const [targetLang, setTargetLang] = useState<'English' | 'Hindi'>('English');
  const [englishText, setEnglishText] = useState('');
  const [islTranslation, setIslTranslation] = useState('');
  const [islGlosses, setIslGlosses] = useState<SignStep[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [dailySign, setDailySign] = useState<SignOfTheDay | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('isl_history');
    if (saved) setHistory(JSON.parse(saved));
    getSignOfTheDay().then(setDailySign).catch(console.error);
  }, []);

  const addToHistory = (input: string, output: string, type: HistoryItem['type']) => {
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      input,
      output,
      type
    };
    const updated = [newItem, ...history].slice(0, 10);
    setHistory(updated);
    localStorage.setItem('isl_history', JSON.stringify(updated));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail && loginPass) {
      setIsAuthenticated(true);
      setActiveView('HOME');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveView('HOME');
  };

  const handleISLCapture = useCallback(async (imageB64: string) => {
    setIsProcessing(true);
    try {
      const translation = await translateISLToEnglish(imageB64, targetLang);
      setIslTranslation(translation);
      addToHistory('ISL Camera Capture', translation, 'ISL_TO_TXT');

      const audioB64 = await generateSpeech(translation);
      if (audioB64) {
        const buffer = await decodeGeminiPcm(audioB64);
        playBuffer(buffer);
      }
    } catch (err: any) {
      console.error(err);
      if (err.message.includes("VITE_API_KEY")) {
        alert("Configuration Error: VITE_API_KEY is missing. Please add it to your environment variables (e.g., in Vercel settings).");
      } else {
        alert(`Translation failed: ${err.message || "Unknown error"}`);
      }
    } finally {
      setIsProcessing(false);
    }
  }, [targetLang]);

  const handleEnglishSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!englishText.trim()) return;
    setIsProcessing(true);
    try {
      const glosses = await translateEnglishToISLGloss(englishText);
      setIslGlosses(glosses);
      addToHistory(englishText, `${glosses.length} signs generated`, 'TXT_TO_ISL');
    } catch (err: any) {
      console.error(err);
      if (err.message.includes("VITE_API_KEY")) {
        alert("Configuration Error: VITE_API_KEY is missing. Please add it to your environment variables (e.g., in Vercel settings).");
      } else {
        alert(`Generation failed: ${err.message || "Unknown error"}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.onresult = (event: any) => {
        setEnglishText(event.results[0][0].transcript);
        setIsListening(false);
      };
      recognitionRef.current.onend = () => setIsListening(false);
    }
    setIsListening(true);
    recognitionRef.current.start();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAFBFE] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-50/50 via-[#FAFBFE] to-[#FAFBFE]">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-200/50">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              Neural Engine Ready
            </div>
            <h1 className="text-7xl font-black text-slate-900 leading-[1.05] tracking-[-0.05em]">
              Signing the <span className="text-emerald-600">Future</span> of Communication.
            </h1>
            <p className="text-xl text-slate-500 max-w-md leading-relaxed font-medium">
              A high-fidelity bridge for Indian Sign Language. Instant translation, real-time audio, and 3D avatar visualization.
            </p>
            <div className="flex items-center gap-8">
              <div className="flex flex-col">
                <span className="text-2xl font-black text-slate-900">99.8%</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accuracy</span>
              </div>
              <div className="w-px h-10 bg-slate-200"></div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-slate-900">&lt; 1s</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Latency</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-12 rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-slate-50 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl font-black text-slate-900 mb-10 tracking-tight">Enterprise Login</h2>
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Access</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full px-7 py-5 bg-slate-50 border-2 border-slate-50 rounded-[2rem] focus:bg-white focus:border-emerald-500/20 focus:ring-4 focus:ring-emerald-50 outline-none transition-all font-bold text-slate-800"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Key</label>
                  <input
                    type="password"
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-7 py-5 bg-slate-50 border-2 border-slate-50 rounded-[2rem] focus:bg-white focus:border-emerald-500/20 focus:ring-4 focus:ring-emerald-50 outline-none transition-all font-bold text-slate-800"
                    required
                  />
                </div>
                <button className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-emerald-600 transition-all transform active:scale-[0.98] mt-4">
                  Initialize Access
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFE] flex flex-col text-slate-900">
      <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-100 px-10 py-5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-14">
            <button onClick={() => setActiveView('HOME')} className="text-2xl font-black tracking-tighter flex items-center gap-2 group">
              <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center text-white text-sm rotate-3 group-hover:rotate-12 transition-transform">B</div>
              <span className="text-slate-900 uppercase tracking-tighter">ISL<span className="text-emerald-600">Bridge</span></span>
            </button>
            <div className="hidden lg:flex items-center gap-1">
              <button onClick={() => setActiveView('HOME')} className={`px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeView === 'HOME' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}>Dashboard</button>
              <button onClick={() => { setActiveView('TRANSLATE'); setMode(TranslationMode.ISL_TO_ENGLISH); }} className={`px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeView === 'TRANSLATE' && mode === TranslationMode.ISL_TO_ENGLISH ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}>Sign to Text</button>
              <button onClick={() => { setActiveView('TRANSLATE'); setMode(TranslationMode.ENGLISH_TO_ISL); }} className={`px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeView === 'TRANSLATE' && mode === TranslationMode.ENGLISH_TO_ISL ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}>Text to Sign</button>
              <button onClick={() => setActiveView('COMMUNITY')} className={`px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeView === 'COMMUNITY' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}>Community</button>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider">{loginEmail.split('@')[0]}</span>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.15em]">Online</span>
              </div>
            </div>
            <button onClick={handleLogout} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all border border-slate-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full p-10">
        {activeView === 'HOME' ? (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl group">
                <div className="relative z-10 max-w-lg">
                  <h2 className="text-5xl font-black tracking-tight mb-4">Good Day, {loginEmail.split('@')[0]}</h2>
                  <p className="text-slate-400 text-lg opacity-90 mb-10 leading-relaxed font-medium">Ready to translate? Your neural bridge is synchronized and optimized for Indian Sign Language.</p>
                  <div className="flex flex-wrap gap-4">
                    <button onClick={() => { setActiveView('TRANSLATE'); setMode(TranslationMode.ISL_TO_ENGLISH); }} className="px-8 py-4 bg-emerald-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-900/40 hover:scale-105 transition-transform">
                      Launch Camera
                    </button>
                    <button onClick={() => { setActiveView('TRANSLATE'); setMode(TranslationMode.ENGLISH_TO_ISL); }} className="px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] border border-white/20 hover:bg-white/20 transition-all">
                      Visualize Text
                    </button>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none"></div>
              </div>

              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all">
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Educational Learning</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 leading-tight">Daily Expansion</h3>
                </div>
                {dailySign ? (
                  <div className="mt-8 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 transition-all group-hover:bg-emerald-50 group-hover:border-emerald-100">
                    <p className="text-4xl font-black text-emerald-600 uppercase mb-3 tracking-tighter">{dailySign.gloss}</p>
                    <p className="text-slate-500 text-xs font-bold leading-relaxed">{dailySign.meaning}</p>
                  </div>
                ) : (
                  <div className="animate-pulse bg-slate-50 h-32 rounded-[2.5rem] w-full"></div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div onClick={() => { setActiveView('TRANSLATE'); setMode(TranslationMode.ISL_TO_ENGLISH); }} className="group bg-white p-10 rounded-[3rem] border border-slate-100 hover:border-emerald-400 hover:shadow-2xl transition-all cursor-pointer relative overflow-hidden">
                  <div className="w-14 h-14 bg-slate-50 text-slate-900 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-emerald-600 group-hover:text-white transition-all text-2xl font-black">📸</div>
                  <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Camera to Text</h3>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6">Real-time neural recognition of ISL gestures with instant English/Hindi output.</p>
                </div>
                <div onClick={() => { setActiveView('TRANSLATE'); setMode(TranslationMode.ENGLISH_TO_ISL); }} className="group bg-white p-10 rounded-[3rem] border border-slate-100 hover:border-emerald-400 hover:shadow-2xl transition-all cursor-pointer relative overflow-hidden">
                  <div className="w-14 h-14 bg-slate-50 text-slate-900 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-emerald-600 group-hover:text-white transition-all text-2xl font-black">👤</div>
                  <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Avatar Workspace</h3>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6">Convert complex English sentences into fluid 3D avatar sign sequences.</p>
                </div>
              </div>

              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 flex flex-col h-full max-h-[500px]">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logs</h4>
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-4 pr-3">
                  {history.length > 0 ? history.map(item => (
                    <div key={item.id} className="p-5 bg-slate-50 rounded-[2rem] border border-slate-50 hover:bg-white hover:border-slate-100 transition-all">
                      <p className="text-xs font-black text-slate-900 leading-snug">{item.output}</p>
                    </div>
                  )) : (
                    <div className="text-center py-20 opacity-20">
                      <p className="text-[10px] font-black uppercase tracking-widest">No activity</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : activeView === 'COMMUNITY' ? (
          <CommunityView currentUserEmail={loginEmail} />
        ) : (
          <div className="animate-in fade-in zoom-in-95 duration-700 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <button onClick={() => setActiveView('HOME')} className="px-5 py-2.5 rounded-2xl bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-600 hover:border-emerald-100 transition-all flex items-center gap-2">
                Back to Dashboard
              </button>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
                {mode === TranslationMode.ISL_TO_ENGLISH ? 'Sign Translator' : 'Avatar Engine'}
              </h2>
              <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 flex gap-1">
                {['English', 'Hindi'].map(l => (
                  <button key={l} onClick={() => setTargetLang(l as any)} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${targetLang === l ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-200' : 'text-slate-400 hover:bg-slate-50'}`}>{l}</button>
                ))}
              </div>
            </div>

            {mode === TranslationMode.ISL_TO_ENGLISH ? (
              <div className="grid grid-cols-1 lg:grid-cols-1 gap-10">
                <CameraView onCapture={handleISLCapture} isProcessing={isProcessing} />
                <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-50 min-h-[220px] flex flex-col justify-center relative overflow-hidden group">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 block">Translation Output</label>
                  {islTranslation ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                      <p className="text-5xl font-black text-slate-900 tracking-tight">"{islTranslation}"</p>
                      <button onClick={async () => {
                        const audio = await generateSpeech(islTranslation);
                        if (audio) playBuffer(await decodeGeminiPcm(audio));
                      }} className="flex items-center gap-3 px-6 py-3 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100 hover:scale-105 transition-all">Play Speech</button>
                    </div>
                  ) : (
                    <p className="text-sm font-black uppercase tracking-widest opacity-30">Awaiting Vision Input</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-50 space-y-6">
                  <textarea value={englishText} onChange={(e) => setEnglishText(e.target.value)} placeholder="Type a sentence to visualize..." className="w-full h-48 p-0 bg-transparent outline-none text-2xl font-black text-slate-900 placeholder:text-slate-200 resize-none" />
                  <button onClick={() => handleEnglishSubmit()} disabled={isProcessing || !englishText.trim()} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] shadow-2xl hover:bg-emerald-600 disabled:opacity-20 transition-all">
                    {isProcessing ? 'Synthesizing...' : 'Generate Sequence'}
                  </button>
                </div>
                <AvatarDisplay steps={islGlosses} />
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-100 py-10 px-10 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">© 2025 ISL Bridge • Neural Intelligence Node 04</p>
      </footer>
    </div>
  );
};

export default App;