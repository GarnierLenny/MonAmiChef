import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const CanonicalUrl = () => {
  const location = useLocation();

  useEffect(() => {
    const canonicalUrl = `https://monamichef.com${location.pathname}`;

    // Remove existing canonical link if it exists
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }

    // Add new canonical link
    const link = document.createElement('link');
    link.rel = 'canonical';
    link.href = canonicalUrl;
    document.head.appendChild(link);

    // Update OpenGraph URL
    const existingOgUrl = document.querySelector('meta[property="og:url"]');
    if (existingOgUrl) {
      existingOgUrl.setAttribute('content', canonicalUrl);
    }

    // Update Twitter URL
    const existingTwitterUrl = document.querySelector('meta[property="twitter:url"]');
    if (existingTwitterUrl) {
      existingTwitterUrl.setAttribute('content', canonicalUrl);
    }

    // Cleanup function
    return () => {
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical && canonical.getAttribute('href') === canonicalUrl) {
        canonical.remove();
      }
    };
  }, [location.pathname]);

  return null;
};

export default CanonicalUrl;