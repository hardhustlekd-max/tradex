import React, { useState, useEffect } from 'react';

interface CoinIconProps {
  symbol: string;
  className?: string;
  size?: number;
}

export const CoinIcon: React.FC<CoinIconProps> = ({ symbol, className = "w-6 h-6", size = 24 }) => {
  const cleanSym = symbol.toUpperCase().replace('/USDT', '').replace('USDT', '').trim();
  const cleanLower = cleanSym.toLowerCase();

  const cdnUrls = [
    `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${cleanLower}.png`,
    `https://assets.coincap.io/assets/icons/${cleanLower}@2x.png`,
    `https://cryptoicon-api.vercel.app/api/icon/${cleanLower}`
  ];

  const [urlIndex, setUrlIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setUrlIndex(0);
    setHasError(false);
  }, [cleanLower]);

  const handleError = () => {
    if (urlIndex < cdnUrls.length - 1) {
      setUrlIndex(urlIndex + 1);
    } else {
      setHasError(true);
    }
  };

  if (hasError || !cleanLower) {
    const bgClasses: Record<string, string> = {
      btc: 'bg-amber-500 text-black',
      eth: 'bg-indigo-600 text-white',
      sol: 'bg-purple-600 text-white',
      usdt: 'bg-emerald-600 text-white',
      xrp: 'bg-blue-600 text-white',
      doge: 'bg-yellow-500 text-black',
      avax: 'bg-red-600 text-white',
      link: 'bg-blue-500 text-white',
      sui: 'bg-sky-500 text-white',
      pepe: 'bg-emerald-500 text-black',
      shib: 'bg-orange-500 text-white',
    };
    const bgClass = bgClasses[cleanLower] || 'bg-zinc-700 text-zinc-300';
    return (
      <div 
        className={`${className} rounded-full flex items-center justify-center font-black text-[10px] uppercase shrink-0 select-none ${bgClass}`}
        style={{ width: size, height: size }}
      >
        {(cleanSym || symbol).slice(0, 3)}
      </div>
    );
  }

  return (
    <img
      src={cdnUrls[urlIndex]}
      alt={cleanSym}
      className={`${className} rounded-full object-cover shrink-0 select-none`}
      style={{ width: size, height: size }}
      onError={handleError}
      referrerPolicy="no-referrer"
    />
  );
};

