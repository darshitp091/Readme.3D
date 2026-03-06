import React, { useEffect, useRef } from 'react';

interface AdsterraAdProps {
  id: string;
  format: 'banner' | 'social-bar' | 'popunder';
}

export const AdsterraAd: React.FC<AdsterraAdProps> = ({ id, format }) => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id || id.startsWith('banner-')) return; // Don't run for placeholders

    try {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `//www.highperformanceformat.com/${id}/invoke.js`;
      script.async = true;
      
      // Adsterra often requires atOptions to be set on window
      const optionsScript = document.createElement('script');
      optionsScript.type = 'text/javascript';
      optionsScript.innerHTML = `
        atOptions = {
          'key' : '${id}',
          'format' : 'iframe',
          'height' : ${format === 'banner' ? 90 : 250},
          'width' : ${format === 'banner' ? 728 : 300},
          'params' : {}
        };
      `;

      if (adRef.current) {
        adRef.current.innerHTML = ''; // Clear previous
        adRef.current.appendChild(optionsScript);
        adRef.current.appendChild(script);
      }
    } catch (err) {
      console.error('Failed to load Adsterra ad:', err);
    }
  }, [id, format]);

  return (
    <div 
      ref={adRef}
      className="w-full min-h-[100px] bg-white/5 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden"
    >
      <div className="text-[10px] font-bold tracking-widest text-white/20 uppercase">
        {id.startsWith('banner-') ? `Adsterra ${format} Slot (Placeholder)` : `Adsterra ${format} Loading...`}
      </div>
    </div>
  );
};
