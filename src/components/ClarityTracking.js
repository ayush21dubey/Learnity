import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ClarityTracking() {
  const location = useLocation();

  useEffect(() => {
    if (window.clarity) {
      // Track route changes in Clarity
      window.clarity("set", "page_path", location.pathname + location.search);
      window.clarity("set", "page_title", document.title);

      // Log tracking for verification
      console.log('Microsoft Clarity tracked:', {
        page_path: location.pathname + location.search,
        page_title: document.title
      });
    } else {
      console.warn('Microsoft Clarity not loaded');
    }
  }, [location]);

  return null;
}

export default ClarityTracking; 