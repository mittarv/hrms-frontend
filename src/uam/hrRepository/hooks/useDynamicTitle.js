import { useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

const useDynamicTitle = () => {
  const location = useLocation();

  // Memoized function to get page title - only recreated if needed
  const getPageTitle = useCallback((pathname) => {
    // HR Repository related routes
    if (pathname === '/dashboard' || 
        pathname === '/employee-repo' || 
        pathname === '/hr-repo-requests' || 
        pathname === '/leave-configurator' || 
        pathname === '/leave-attendance' || 
        pathname === '/hr-repo' ||
        pathname === '/policies' ||
        pathname === '/imp-link' ||
        pathname === '/payroll-reimbursements') {
      return 'MittArv Toolbox | HRMS';
    }
    
    // Partner Tool routes
    if (pathname === '/partner-tool' || 
        pathname === '/subscriptions-configurator' || 
        pathname === '/configuration-tool' || 
        pathname === '/referral-tracking') {
      return 'MittArv Toolbox | Partner Tool';
    }
    
    // Notification Tool
    if (pathname === '/notification-tool') {
      return 'MittArv Toolbox | Notification Tool';
    }
    
    // Known Issues
    if (pathname === '/known-issues' || pathname === '/known-issues/imp-link') {
      return 'MittArv Toolbox | Known Issues';
    }
    
    // Language Text Editor
    if (pathname.includes('/language-text-editor')) {
      return 'MittArv Toolbox | Language Editor';
    }
    
    // Analytics
    if (pathname === '/analytical-dashboard') {
      return 'MittArv Toolbox | Analytics';
    }
    
    // Asset Vault
    if (pathname === '/asset-vault-forms') {
      return 'MittArv Toolbox | Asset Vault';
    }
    
    // Feature Flags
    if (pathname === '/feature-flags') {
      return 'MittArv Toolbox | Feature Flags';
    }
    
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
