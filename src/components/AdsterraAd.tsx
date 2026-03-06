import React, { useEffect, useRef } from 'react';

interface AdsterraAdProps {
  id: string;
  format: 'banner' | 'social-bar' | 'popunder';
}

export const AdsterraAd: React.FC<AdsterraAdProps> = ({ id, format }) => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // This is a placeholder for where the user would put their Adsterra script logic.
    // Usually, Adsterra provides a script tag that needs to be injected.
    console.log(`Adsterra Ad ${format} with ID ${id} would be initialized here.`);
    
    // Example of how they might inject a script:
    /*
    const script = document.createElement('script');
    script.src = `//www.highperformanceformat.com/${id}/invoke.js`;
    script.async = true;
    adRef.current?.appendChild(script);
    */
  }, [id, format]);

  return (
    <div 
      ref={adRef}
      className="w-full min-h-[100px] bg-white/5 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden"
    >
      <div className="text-[10px] font-bold tracking-widest text-white/20 uppercase">
        Adsterra {format} Slot
      </div>
    </div>
  );
};
