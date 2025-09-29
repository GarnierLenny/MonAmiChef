import { useEffect } from 'react';

const OrganizationStructuredData = () => {
  useEffect(() => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Mon Ami Chef",
      "alternateName": "MonAmiChef",
      "url": "https://monamichef.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://monamichef.com/favicon.png",
        "width": "512",
        "height": "512"
      },
      "description": "AI-powered recipe generator and cooking assistant. Generate personalized recipes based on your ingredients, dietary preferences, and cooking style.",
      "foundingDate": "2024",
      "sameAs": [
        "https://monamichef.com"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "url": "https://monamichef.com"
      },
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "FR"
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "AI Recipe Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "name": "AI Recipe Generation",
            "description": "Generate personalized recipes using artificial intelligence",
            "category": "Software as a Service"
          },
          {
            "@type": "Offer",
            "name": "Meal Planning",
            "description": "AI-powered weekly meal planning and grocery lists",
            "category": "Software as a Service"
          },
          {
            "@type": "Offer",
            "name": "Nutrition Analysis",
            "description": "Detailed nutritional analysis and calorie tracking",
            "category": "Software as a Service"
          }
        ]
      }
    };

    // Remove existing organization structured data
    const existingScript = document.querySelector('script[data-organization]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new organization structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-organization', 'true');
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      const scriptToRemove = document.querySelector('script[data-organization]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);

  return null;
};

export default OrganizationStructuredData;