import React, { useState, useEffect } from 'react';

interface CoinIconProps {
  symbol: string;
  className?: string;
  size?: number;
}

export const CoinIcon: React.FC<CoinIconProps> = ({ symbol, className = "w-6 h-6", size = 24 }) => {
  // Strip any pair symbols like /USDT
  const cleanSym = symbol.toUpperCase().replace('/USDT', '').replace('USDT', 'usdt');
  const cleanLower = cleanSym.toLowerCase();

  // Spothq Cryptocurrency Icons raw CDN
  const cdnUrl = `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${cleanLower}.png`;
  
  const [imgSrc, setImgSrc] = useState<string>(cdnUrl);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
    setImgSrc(`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${cleanLower}.png`);
  }, [cleanLower]);

  if (hasError || cleanLower === 'nexus') {
    // Stylized high-contrast typography background circle
    const bgClasses: Record<string, string> = {
      btc: 'bg-amber-500 text-black',
      eth: 'bg-indigo-600 text-white',
      sol: 'bg-purple-600 text-white',
      usdt: 'bg-emerald-600 text-white',
      nexus: 'bg-gradient-to-r from-[#00c076] to-[#00d080] text-black',
    };
    const bgClass = bgClasses[cleanLower] || 'bg-zinc-700 text-zinc-300';
    return (
      <div 
        className={`${className} rounded-full flex items-center justify-center font-black text-[10px] uppercase shrink-0 select-none ${bgClass}`}
        style={{ width: size, height: size }}
      >
        {cleanSym.slice(0, 3)}
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={cleanSym}
      className={`${className} rounded-full object-cover shrink-0 select-none`}
      style={{ width: size, height: size }}
      onError={() => setHasError(true)}
      referrerPolicy="no-referrer"
    />
  );
};
