import { useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

const useHrmsDynamicTitle = () => {
  const location = useLocation();

  // Memoized function to get page title - only recreated if needed
  const getPageTitle = useCallback((pathname) => {
    // HR Repository related routes
    if (pathname === '/dashboard') {
      return 'MittArv Toolbox | HRMS - Dashboard';
    }
    if (pathname === '/employee-repo' || pathname === '/employee-directory') {
      return 'MittArv Toolbox | HRMS - Employee Repository';
    }
    if (pathname === '/hr-repo-requests') {
      return 'MittArv Toolbox | HRMS - Requests';
    }
    if (pathname === '/leave-configurator') {
      return 'MittArv Toolbox | HRMS - Leave Configurator';
    }
    if (pathname === '/leave-attendance') {
      return 'MittArv Toolbox | HRMS - Leave & Attendance';
    }
    if (pathname === '/hr-repo') {
      return 'MittArv Toolbox | HRMS - Home';
    }
    if (pathname === '/policies') {
      return 'MittArv Toolbox | HRMS - Policies';
    }
    if (pathname === '/imp-link') {
      return 'MittArv Toolbox | HRMS - Important Links';
    }
    if (pathname === '/payroll-reimbursements') {
      return 'MittArv Toolbox | HRMS - Payroll & Reimbursements';
    }
    if (pathname === '/hrms-access') {
      return 'MittArv Toolbox | HRMS - Access Management';
    }
    
    // Default title for HRMS routes
    return 'MittArv Toolbox | HRMS';
  }, []);

  const pageTitle = useMemo(() => getPageTitle(location.pathname), [location.pathname, getPageTitle]);

  // Effect only runs when the calculated title actually changes
  useEffect(() => {
    if (document.title !== pageTitle) {
      document.title = pageTitle;
    }
  }, [pageTitle]);
};

export default useHrmsDynamicTitle;
