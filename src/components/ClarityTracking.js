import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ClarityTracking() {
  const location = useLocation();

  useEffect(() => {
    // Track route changes in Clarity
    if (window.clarity) {
      window.clarity("set", "page_path", location.pathname + location.search);
    }
  }, [location]);

  return null;
}

export default ClarityTracking; 