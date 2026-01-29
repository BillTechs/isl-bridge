
import React, { useRef, useEffect, useState, useCallback } from 'react';

interface CameraViewProps {
  onCapture: (imageB64: string) => void;
  isProcessing: boolean;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture, isProcessing }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsActive(true);
        }
      } catch (err) {
        console.error("Camera access denied", err);
      }
    }
    startCamera();
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const handleCapture = useCallback(() => {
    setIsCapturing(true);
    
    // Flash effect delay
    setTimeout(() => {
      if (!videoRef.current || !canvasRef.current) return;
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        onCapture(dataUrl.split(',')[1]);
      }
      setIsCapturing(false);
    }, 150);
  }, [onCapture]);

  return (
    <div className="relative w-full aspect-video bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-slate-800">
      {!isActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-900">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-700 border-t-emerald-500 mb-4"></div>
          <p className="text-[10px] font-black uppercase tracking-widest">Waking Neural Eye...</p>
        </div>
      )}
      
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover transition-opacity duration-700 ${isActive ? 'opacity-100' : 'opacity-0'}`}
      />
      
      <canvas ref={canvasRef} className="hidden" />

      {/* Flash Effect */}
      {isCapturing && <div className="absolute inset-0 bg-white z-50 animate-out fade-out duration-300" />}
      
      {/* HUD Overlays */}
      <div className="absolute inset-0 pointer-events-none border-[24px] border-black/10 flex items-center justify-center">
        <div className="w-full h-full border border-white/20 rounded-2xl relative">
            <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-emerald-500"></div>
            <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-emerald-500"></div>
            <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-emerald-500"></div>
            <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-emerald-500"></div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6">
        <button
          onClick={handleCapture}
          disabled={isProcessing || !isActive}
          className={`group relative flex items-center gap-3 px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs transition-all transform active:scale-95 ${
            isProcessing 
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
              : 'bg-white text-slate-900 hover:bg-emerald-50 hover:text-emerald-600 shadow-2xl'
          }`}
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse group-hover:bg-emerald-500 transition-colors"></div>
              <span>Capture ISL Sign</span>
            </>
          )}
        </button>
      </div>

      <div className="absolute top-6 left-6 flex gap-2">
        <div className="px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full flex items-center gap-2 border border-white/10">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
          <span className="text-[9px] font-black text-white uppercase tracking-widest">Live Cam</span>
        </div>
      </div>
    </div>
  );
};

export default CameraView;
