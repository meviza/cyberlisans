'use client';

import * as React from 'react';

export interface ProductImageGalleryProps {
  images: string[];
}

export function ProductImageGallery({ images }: ProductImageGalleryProps) {
  const [activeImage, setActiveImage] = React.useState(0);

  if (images.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_120px]">
      <div
        className="aspect-video w-full rounded-md border border-cyber-cyan/20"
        style={{ background: images[activeImage] }}
      />
      {images.length > 1 && (
        <div className="grid grid-cols-3 gap-2 md:grid-cols-1">
          {images.map((src, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveImage(idx)}
              aria-label={`Görsel ${idx + 1}`}
              className={
                idx === activeImage
                  ? 'aspect-square rounded-md border border-cyber-cyan'
                  : 'aspect-square rounded-md border border-white/10 opacity-70 hover:opacity-100'
              }
              style={{ background: src }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
