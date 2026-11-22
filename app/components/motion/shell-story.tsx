'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sparkles,
  Shield,
  Droplets,
  Wind,
  Lock,
  RotateCcw,
} from 'lucide-react';

export default function ShellStory() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  // Attempt initial autoplay safely
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Autoplay requires muted in modern browsers
    video.muted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setHasStarted(true);
        })
        .catch(() => {
          // If browser policy requires user interaction, fallback gracefully
          setIsPlaying(false);
        });
    }
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
      setHasStarted(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    const newMuted = !video.muted;
    video.muted = newMuted;
    setIsMuted(newMuted);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const restartVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.play();
    setIsPlaying(true);
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
            ref={containerRef}
            className="group relative overflow-hidden rounded-2xl border border-white/15 bg-black/90 shadow-2xl transition-all duration-300"
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
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="h-full w-full object-cover"
              />

              {/* Top Bar Badges Overlay */}
              <div className="pointer-events-none absolute left-4 right-4 top-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-black/60 px-3 py-1 font-sans text-[11px] font-bold uppercase tracking-wider text-red-400 backdrop-blur-md">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                    <span>Loop Active</span>
                  </span>
                  <span className="hidden rounded-full border border-white/10 bg-black/60 px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wider text-slate-300 backdrop-blur-md sm:inline-flex">
                    1080P HD
                  </span>
                </div>

                <span className="rounded-full border border-indigo-500/30 bg-black/60 px-3 py-1 font-sans text-[11px] font-semibold uppercase tracking-wider text-indigo-300 backdrop-blur-md">
                  PulseWear Studio
                </span>
              </div>

              {/* Click-to-Play Center Overlay when paused */}
              {!isPlaying && (
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label="Play video"
                  className="absolute inset-0 m-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-indigo-600/80 text-white shadow-2xl backdrop-blur-md transition-transform duration-200 hover:scale-110 active:scale-95"
                >
                  <Play className="ml-1 h-8 w-8" fill="currentColor" />
                </button>
              )}

              {/* Bottom Control Bar */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 transition-opacity duration-300 sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  {/* Left Controls: Play / Pause & Restart */}
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={togglePlay}
                      aria-label={isPlaying ? 'Pause video' : 'Play video'}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
                    >
                      {isPlaying ? (
                        <Pause className="h-4 w-4" fill="currentColor" />
                      ) : (
                        <Play className="ml-0.5 h-4 w-4" fill="currentColor" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={restartVideo}
                      aria-label="Restart video"
                      title="Replay from start"
                      className="hidden h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-slate-300 backdrop-blur-md transition-colors hover:bg-white/20 hover:text-white sm:flex"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>

                    <span className="hidden text-xs font-medium text-slate-300 sm:inline-block">
                      {isPlaying ? 'Playing on loop' : 'Paused'}
                    </span>
                  </div>

                  {/* Right Controls: Sound Toggle & Fullscreen */}
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={toggleMute}
                      aria-label={isMuted ? 'Unmute video audio' : 'Mute video audio'}
                      title={isMuted ? 'Click to enable audio' : 'Click to mute audio'}
                      className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold backdrop-blur-md transition-all ${
                        isMuted
                          ? 'border-white/10 bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
                          : 'border-indigo-500/40 bg-indigo-600/30 text-indigo-200'
                      }`}
                    >
                      {isMuted ? (
                        <>
                          <VolumeX className="h-4 w-4" />
                          <span className="hidden sm:inline">Muted</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-4 w-4 text-cyan-400" />
                          <span className="hidden sm:inline">Sound On</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={toggleFullscreen}
                      aria-label="Toggle Fullscreen"
                      title="Fullscreen"
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
                    >
                      {isFullscreen ? (
                        <Minimize2 className="h-4 w-4" />
                      ) : (
                        <Maximize2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
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
