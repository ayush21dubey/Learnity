import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function Analytics() {
  const location = useLocation();

  useEffect(() => {
    if (window.gtag) {
      // Track page views
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_path: location.pathname + location.search,
        page_location: window.location.href
      });

      // Log tracking for verification
      console.log('Google Analytics tracked:', {
        page_title: document.title,
        page_path: location.pathname + location.search,
        page_location: window.location.href
      });
    } else {
      console.warn('Google Analytics (gtag) not loaded');
    }
  }, [location]);

  return null;
}

export default Analytics; 