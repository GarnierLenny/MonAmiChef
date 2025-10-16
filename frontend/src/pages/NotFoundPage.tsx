import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

const NotFoundPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Set proper 404 title and meta
    document.title = "Page Not Found - Mon Ami Chef";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', "The page you're looking for doesn't exist. Discover AI-generated recipes and cooking tools at Mon Ami Chef.");
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-orange-50 px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-orange-600">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800">Page Not Found</h2>
          <p className="text-gray-600">
            Sorry, the page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => navigate('/')}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
          >
            Go to Recipe Generator
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="w-full border-orange-300 text-orange-600 hover:bg-orange-50"
          >
            Go Back
          </Button>
        </div>

        <div className="text-sm text-gray-500 space-y-1">
          <p>Popular pages:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => navigate('/macros')}
              className="text-orange-600 hover:underline"
            >
              Macros
            </button>
            <span>•</span>
            <button
              onClick={() => navigate('/calories')}
              className="text-orange-600 hover:underline"
            >
              Calories
            </button>
            <span>•</span>
            <button
              onClick={() => navigate('/explore')}
              className="text-orange-600 hover:underline"
            >
              Explore
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;