import { memo } from 'react';
import './CosmicBackground.css';

/**
 * Liquid Chrome Backdrop (Aliased to CosmicBackground for compatibility)
 *
 * Provides a quiet, restrained warm graphite atmosphere:
 * - Subtle material depth with low-contrast metallic perimeter sheen.
 * - Flat, crisp, non-distracting, strictly behind technical content.
 * - Completely static, zero CPU / GPU animation overhead.
 * - Respects prefers-reduced-motion.
 *
 * @param {'full'|'medium'|'subtle'} intensity
 */
function CosmicBackground({ intensity = 'subtle' }) {
  return (
    <div className={`cv-chrome-backdrop cv-chrome-backdrop--${intensity}`} aria-hidden="true">
      {/* Deep warm graphite canvas gradient */}
      <div className="cv-chrome-base-gradient" />

      {/* Perimeter material highlight vectors (subtle metallic edge reflections) */}
      <svg
        className="cv-chrome-ribbons"
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="cvEdgeSheen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34373D" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#FF9B54" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#1C1E22" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="cvCornerSheen" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#484C55" stopOpacity="0.25" />
            <stop offset="60%" stopColor="#25282E" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#111214" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Top-Right Perimeter Sheen Curve */}
        <path
          d="M1020 -60 C1180 40, 1320 60, 1480 30"
          stroke="url(#cvEdgeSheen)"
          strokeWidth="1.2"
          fill="none"
        />

        {/* Bottom-Left Perimeter Sheen Curve */}
        <path
          d="M-40 760 C120 720, 260 760, 420 840"
          stroke="url(#cvCornerSheen)"
          strokeWidth="1.2"
          fill="none"
        />
      </svg>
    </div>
  );
}

export default memo(CosmicBackground);
export { CosmicBackground as LiquidChromeBackdrop };
