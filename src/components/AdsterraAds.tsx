import { useEffect } from 'react';

/**
 * AdsterraAds component injects Adsterra ad scripts dynamically
 * based on environment variables.
 */
export const AdsterraAds = () => {
  useEffect(() => {
    // Get script URLs from environment variables
    const popunderUrl = import.meta.env.VITE_ADSTERRA_POPUNDER_URL;
    const socialBarUrl = import.meta.env.VITE_ADSTERRA_SOCIALBAR_URL;

    // Inject Popunder script
    if (popunderUrl && popunderUrl !== 'your_popunder_script_url_here') {
      const script = document.createElement('script');
      script.src = popunderUrl;
      script.async = true;
      document.body.appendChild(script);
    }

    // Inject Social Bar script
    if (socialBarUrl && socialBarUrl !== 'your_socialbar_script_url_here') {
      const script = document.createElement('script');
      script.src = socialBarUrl;
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return null;
};
