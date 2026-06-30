'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface ProductGalleryProps {
  images: string[];
  alt: string;
}

export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const safeImages = images.length > 0 ? images : ['linear-gradient(135deg,#0A0A1F,#1A0A2F)'];
  const [activeIdx, setActiveIdx] = useState(0);

  const next = () => setActiveIdx((i) => (i + 1) % safeImages.length);
  const prev = () => setActiveIdx((i) => (i - 1 + safeImages.length) % safeImages.length);

  const active = safeImages[activeIdx] ?? safeImages[0]!;

  return (
    <div className="space-y-3">
      <div
        className="group relative aspect-square overflow-hidden rounded-2xl border border-cyber-cyan/20"
        style={{ background: active }}
      >
        {safeImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Önceki görsel"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-cyber-darker/80 text-white/80 backdrop-blur-md transition-all hover:border-cyber-cyan/60 hover:text-cyber-cyan"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Sonraki görsel"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-cyber-darker/80 text-white/80 backdrop-blur-md transition-all hover:border-cyber-cyan/60 hover:text-cyber-cyan"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {safeImages.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveIdx(i)}
                  aria-label={`Görsel ${i + 1}`}
                  className={
                    i === activeIdx
                      ? 'h-1.5 w-6 rounded-full bg-cyber-cyan shadow-[0_0_8px_rgba(0,240,255,0.8)]'
                      : 'h-1.5 w-1.5 rounded-full bg-white/30 transition-colors hover:bg-white/60'
                  }
                />
              ))}
            </div>
          </>
        )}
      </div>
      {safeImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {safeImages.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIdx(i)}
              aria-label={`Görsel ${i + 1}`}
              className={
                i === activeIdx
                  ? 'aspect-square overflow-hidden rounded-md border-2 border-cyber-cyan shadow-glow-cyan'
                  : 'aspect-square overflow-hidden rounded-md border border-cyber-cyan/20 opacity-70 transition-opacity hover:opacity-100'
              }
              style={{ background: img }}
            />
          ))}
        </div>
      )}
      <span className="sr-only">{alt}</span>
    </div>
  );
}
