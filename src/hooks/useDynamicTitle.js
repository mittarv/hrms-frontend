import { useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

const useDynamicTitle = () => {
  const location = useLocation();

  // Memoized function to get page title - only recreated if needed
  const getPageTitle = useCallback((pathname) => {
    
    // User Management
    if (pathname === '/user-groups' || 
        pathname === '/user-permissions' || 
        pathname === '/pending-requests') {
      return 'MittArv Toolbox | User Management';
    }
    
    // My Tools
    if (pathname === '/my-tools') {
      return 'MittArv Toolbox | My Tools';
    }
    
    // MittArv Tools
    if (pathname === '/mittarv-tools') {
      return 'MittArv Toolbox | Tools';
    }
    // Default title for other routes
    return 'MittArv Toolbox | UAM System Management';
  }, []);

  const pageTitle = useMemo(() => getPageTitle(location.pathname), [location.pathname, getPageTitle]);

  // Effect only runs when the calculated title actually changes
  useEffect(() => {
    if (document.title !== pageTitle) {
      document.title = pageTitle;
    }
  }, [pageTitle]);
};

export default useDynamicTitle;
