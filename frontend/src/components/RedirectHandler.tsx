import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const RedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;

    // Handle legacy routes that should redirect
    const redirectMap: { [key: string]: string } = {
      '/weekly-planner': '/meal-plan-chat',
      '/plan-week': '/meal-plan-chat',
      '/recipes/history': '/recipes/saved',
      '/history': '/recipes/saved',
      '/planner': '/meal-plan-chat',
      '/meal-planner': '/meal-plan-chat',
      '/cooking-tools': '/timer',
      '/nutrition': '/calories',
    };

    if (redirectMap[path]) {
      navigate(redirectMap[path], { replace: true });
    }
  }, [location.pathname, navigate]);

  return null;
};

export default RedirectHandler;