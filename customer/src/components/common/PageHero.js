import React from 'react';

/**
 * PageHero — full-bleed parking video hero for inner pages.
 * Video + cinematic black/gold overlay + centered content.
 * Uses -mt-20 to bleed under the fixed navbar (Layout adds pt-20).
 */
export default function PageHero({ badge, title, highlight, subtitle, children, compact = true }) {
  return (
    <div className={`relative -mt-20 overflow-hidden bg-black ${compact ? 'pt-28 pb-8' : 'pt-32 pb-12'}`}>
      {/* Parking video background */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/hero_video.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      />
      {/* Cinematic overlay — black + gold tint for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/60 to-[#0a0a0b]" />
      <div className="absolute inset-0 bg-[#e7c588]/[0.06] mix-blend-overlay" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {badge && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-black/50 backdrop-blur-md border border-[#e7c588]/30 rounded-full text-sm font-medium text-[#f3e0ae] mb-4">
            {badge}
          </div>
        )}
        {(title || highlight) && (
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            {title && <span className="text-[#f9f0d7]">{title}</span>}{' '}
            {highlight && (
              <span className="bg-gradient-to-r from-[#e7c588] to-[#f3e0ae] bg-clip-text text-transparent">
                {highlight}
              </span>
            )}
          </h1>
        )}
        {subtitle && (
          <p className="mt-3 text-[#f9f0d7]/70 text-base sm:text-lg max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>

      {/* Bottom fade into page */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0a0a0b] to-transparent" />
    </div>
  );
}
