'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Volume2, VolumeX, Sparkles, Shield, Droplets, Wind, Lock } from 'lucide-react';

export default function ShellStory() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(true);

  // Attempt initial autoplay safely
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Fallback if browser requires interaction
      });
    }
  }, []);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    const newMuted = !video.muted;
    video.muted = newMuted;
    setIsMuted(newMuted);
  };

  return (
    <section
      id="craftsmanship"
      className="relative w-full border-t border-white/10 bg-[#0B0F19] px-4 py-16 text-[#F2F5F7] sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/15 px-3.5 py-1 text-xs font-semibold tracking-wider text-indigo-300">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>PULSEWEAR IN MOTION // BRAND CINEMATIC</span>
          </div>

          <h2 className="mt-3.5 font-display text-3xl font-black uppercase tracking-tight text-white sm:text-4xl lg:text-5xl">
            Engineered in Motion. Tested for Streetwear.
          </h2>

          <p className="mt-2.5 text-xs leading-relaxed text-slate-300 sm:text-sm">
            Watch PulseWear heavyweight garments in action. 500 GSM loopback cotton, 20K MM
            stormproof membranes, and precision ergonomics tested for extreme urban environments.
          </p>
        </div>

        {/* Video Player Display Container */}
        <div className="mx-auto mt-10 max-w-5xl">
          <div
            className="group relative overflow-hidden rounded-2xl border border-white/15 bg-black shadow-2xl transition-all duration-300"
            style={{
              boxShadow:
                '0 25px 60px -15px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Aspect Ratio Framing (16:9 cinematic) */}
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#07090e]">
              <video
                ref={videoRef}
                src="/videos/brand_video.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="h-full w-full object-cover"
              />

              {/* Sound ON / OFF Button Only */}
              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? 'Turn sound on' : 'Turn sound off'}
                title={isMuted ? 'Sound Off (Click to turn on)' : 'Sound On (Click to turn off)'}
                className="absolute bottom-4 right-4 z-10 flex items-center gap-2 rounded-full border border-white/20 bg-black/70 px-4 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-md transition-all hover:border-white/40 hover:bg-black/90 active:scale-95"
              >
                {isMuted ? (
                  <>
                    <VolumeX className="h-4 w-4 text-slate-300" />
                    <span>Sound Off</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="h-4 w-4 text-cyan-400" />
                    <span className="text-cyan-300">Sound On</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid Underneath Video */}
        <div className="mt-12 rounded-2xl border border-white/10 bg-[#12161F]/80 p-6 backdrop-blur-md">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-400">
                <Droplets className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  YKK AquaGuard®
                </h4>
                <p className="text-[11px] text-slate-400">Waterproof sealed zipper tracks</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  German Fidlock®
                </h4>
                <p className="text-[11px] text-slate-400">Magnetic quick-release buckles</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  100% Taped Seams
                </h4>
                <p className="text-[11px] text-slate-400">Thermo-welded leak prevention</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/10 text-violet-400">
                <Wind className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  Laser Underarm Vents
                </h4>
                <p className="text-[11px] text-slate-400">Regulates internal temperature</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
