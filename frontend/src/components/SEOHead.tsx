import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
}

const SEOHead = ({ title, description, keywords, image }: SEOHeadProps) => {
  const location = useLocation();

  useEffect(() => {
    const defaultTitle = "Mon Ami Chef - AI-Powered Recipe Generator";
    const defaultDescription = "Generate personalized recipes with AI based on your ingredients, dietary preferences, and cooking style. Save and share your favorite recipes.";
    const defaultKeywords = "AI recipes, recipe generator, cooking, ingredients, meal planning, personalized recipes, chef assistant";
    const defaultImage = "https://monamichef.com/favicon.png";

    // Update title
    document.title = title || defaultTitle;

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description || defaultDescription);
    }

    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', keywords || defaultKeywords);
    }

    // Update OpenGraph title
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', title || defaultTitle);
    }

    // Update OpenGraph description
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', description || defaultDescription);
    }

    // Update OpenGraph image
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) {
      ogImage.setAttribute('content', image || defaultImage);
    }

    // Update Twitter title
    const twitterTitle = document.querySelector('meta[property="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', title || defaultTitle);
    }

    // Update Twitter description
    const twitterDescription = document.querySelector('meta[property="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.setAttribute('content', description || defaultDescription);
    }

    // Update Twitter image
    const twitterImage = document.querySelector('meta[property="twitter:image"]');
    if (twitterImage) {
      twitterImage.setAttribute('content', image || defaultImage);
    }

  }, [title, description, keywords, image, location.pathname]);

  return null;
};

export default SEOHead;