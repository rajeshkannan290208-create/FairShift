import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: number;
  showTagline?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 32,
  showTagline = false
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div 
        className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#1e1e1e] to-[#06110C] border border-[#A31C1B]/40 shadow-lg shadow-[#A31C1B]/15"
        style={{ width: size, height: size }}
      >
        <svg 
          viewBox="0 0 40 40" 
          className="w-3/4 h-3/4" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Shield with Crimson Red */}
          <path 
            d="M20 4L32 9V19C32 26.5 26.8 33.5 20 36C13.2 33.5 8 26.5 8 19V9L20 4Z" 
            stroke="#A31C1B" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          {/* Inner Balance Beam & Scales with Forest Green Emerald */}
          <line x1="13" y1="18" x2="27" y2="18" stroke="#1FB882" strokeWidth="2" strokeLinecap="round" />
          <circle cx="20" cy="18" r="2.5" fill="#A31C1B" />
          <path d="M20 18V11" stroke="#1FB882" strokeWidth="2" strokeLinecap="round" />
          <path d="M14 18L12 24H16L14 18Z" fill="#1FB882" fillOpacity="0.75" />
          <path d="M26 18L24 24H28L26 18Z" fill="#1FB882" fillOpacity="0.75" />
        </svg>
      </div>

      <div>
        <div className="flex items-center gap-1.5">
          <span className="font-display font-bold text-xl tracking-tight text-[#f8f7f2]">
            Fair<span className="text-[#A31C1B]">Shift</span>
          </span>
          <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#06110C] text-[#1FB882] border border-[#1FB882]/30">
            SDG 8
          </span>
        </div>
        {showTagline && (
          <p className="text-xs text-stone-400 font-normal leading-tight">
            Every hour counts. Every voice matters.
          </p>
        )}
      </div>
    </div>
  );
};
