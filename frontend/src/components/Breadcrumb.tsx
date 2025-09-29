import { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbProps {
  customItems?: BreadcrumbItem[];
  showHome?: boolean;
}

const Breadcrumb = ({ customItems, showHome = true }: BreadcrumbProps) => {
  const location = useLocation();

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (customItems) {
      return showHome ? [{ name: 'Home', href: '/' }, ...customItems] : customItems;
    }

    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    if (showHome) {
      breadcrumbs.push({ name: 'Home', href: '/' });
    }

    // Define route mappings for better breadcrumb names
    const routeMap: { [key: string]: string } = {
      'macros': 'Recipe Macros',
      'calories': 'Calorie Calculator',
      'timer': 'Cooking Timer',
      'notifications': 'Notifications',
      'dashboard': 'Dashboard',
      'meal-plan-chat': 'Meal Planning',
      'explore': 'Explore Recipes',
      'recipes': 'Recipes',
      'saved': 'Saved Recipes',
      'profile': 'Profile',
      'recipe': 'Recipe',
    };

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const name = routeMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

      // Don't add the last segment if it's a dynamic ID (like recipe/:id)
      if (index === pathSegments.length - 1 && segment.match(/^[a-f0-9-]{36}$/)) {
        breadcrumbs.push({ name: 'Recipe Details', href: currentPath });
      } else {
        breadcrumbs.push({ name, href: currentPath });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Generate JSON-LD structured data for Google
  useEffect(() => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": `https://monamichef.com${item.href}`
      }))
    };

    // Remove existing breadcrumb structured data
    const existingScript = document.querySelector('script[data-breadcrumb]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new breadcrumb structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-breadcrumb', 'true');
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      const scriptToRemove = document.querySelector('script[data-breadcrumb]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [breadcrumbs]);

  // Don't show breadcrumbs on home page unless there are custom items
  if (location.pathname === '/' && !customItems) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-1 text-sm text-gray-600 mb-4">
      {breadcrumbs.map((item, index) => (
        <div key={item.href} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
          )}
          {index === breadcrumbs.length - 1 ? (
            // Current page - not clickable
            <span className="text-gray-900 font-medium flex items-center">
              {index === 0 && item.name === 'Home' && (
                <Home className="w-4 h-4 mr-1" />
              )}
              {item.name}
            </span>
          ) : (
            // Clickable breadcrumb link
            <Link
              to={item.href}
              className="hover:text-orange-600 transition-colors flex items-center"
            >
              {index === 0 && item.name === 'Home' && (
                <Home className="w-4 h-4 mr-1" />
              )}
              {item.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumb;