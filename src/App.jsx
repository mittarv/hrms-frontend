import { useCallback, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, Routes, Route } from "react-router-dom";

import "./App.scss";
import Login from "./components/login/Login";
import Layout from "./uam/uamHome/Layout";
import PrivateRoute from "./PrivateRoute";
import useDynamicTitle from "./hooks/useDynamicTitle";

import { loadUserInfo } from "./actions/userActions";
import { getOrganizationDetails } from "./actions/hrRepositoryAction";

// import ToolHome from "./tools/toolHome/ToolHome";
import { clearAuth, getToken, setToken } from "./utils/authStorage";
import { getRootDomain, extractSubdomainFromHostname } from "./utils/domainUtils";
import axios from "axios";

import mittArvLogo from "./assets/images/mittarv_logo_dark.svg";

// Inline component for inactive/suspended orgs (no external dependency needed)
const OrgInactive = () => {
  const handleGoToLogin = () => {
    clearAuth();
    localStorage.clear();
    window.location.href = "/";
  };
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f5f5f5' }}>
      <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', maxWidth: '450px' }}>
        <img src={mittArvLogo} alt="MittArv Logo" style={{ height: '44px', marginBottom: '20px', objectFit: 'contain' }} />
        <h2 style={{ color: '#033348', marginBottom: '16px' }}>Organization Not Found</h2>
        <p style={{ color: '#555', marginBottom: '24px' }}>
          The organization you are trying to access is either inactive or does not exist. Please contact your administrator.
        </p>
        <button
          onClick={handleGoToLogin}
          style={{ padding: '10px 24px', backgroundColor: '#033348', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}
        >
          Return to Login
        </button>
      </div>
    </div>
  );
};

import { Navigate } from "react-router-dom";

const basicRoutes = [
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  { path: "/org-inactive", element: <OrgInactive /> },
];

const accessBasedRoutes = [];

const App = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  useDynamicTitle();

  const { isAuthenticated, loading, redirectSubdomain } = useSelector(
    (state) => state.user
  );

  useEffect(() => {
    dispatch(loadUserInfo());
    dispatch(getOrganizationDetails());
  }, [dispatch]);

  // Handles redirecting to primary tenant or switching tenant when on wrong subdomain
  const handleTenantRedirect = useCallback(async () => {
    if (!isAuthenticated || !redirectSubdomain) return;

    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);

    if (isLocalhost || hostname.startsWith(`${redirectSubdomain}.`)) return;

    const currentSubdomain = extractSubdomainFromHostname(hostname);
    const envDomain = import.meta.env.VITE_AUTH_DOMAIN;
    const rootDomain = getRootDomain();
    const cleanEnvDomain = envDomain ? envDomain.replace(/^\./, "") : "";
    const loginSubdomain = cleanEnvDomain.split('.')[0];
    const protocol = window.location.protocol;
    const port = window.location.port ? `:${window.location.port}` : '';

    // On central domain, login subdomain, or no subdomain → redirect to primary tenant
    const isCentralHost = hostname === rootDomain || hostname === cleanEnvDomain || !currentSubdomain || (loginSubdomain && currentSubdomain === loginSubdomain);
    if (isCentralHost) {
      window.location.href = `${protocol}//${redirectSubdomain}.${rootDomain}${port}/`;
      return;
    }

    // On a different tenant subdomain → attempt to switch tenant
    try {
      const token = getToken();
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_HOSTED_URL}/api/tms/users/switch-tenant`,
        { targetSubdomain: currentSubdomain },
        { headers: { Authorization: token } }
      );

      if (response.data.success && response.data.token) {
        setToken(response.data.token);
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to switch tenant:", error);
      // No access to this tenant → redirect to primary org
      window.location.href = `${protocol}//${redirectSubdomain}.${rootDomain}${port}/`;
    }
  }, [isAuthenticated, redirectSubdomain]);

  // Auto-redirect or switch tenant when authenticated on a different domain
  useEffect(() => {
    handleTenantRedirect();
  }, [handleTenantRedirect]);


  const isHeaderlessRoute = useMemo(() => {
    const noHeaderPaths = [
      "/",
      "/org-inactive"
    ];
    return (
      noHeaderPaths.some((path) => location.pathname === path) 
    );
  }, [location.pathname]);

  if (loading) return <div className="loader">Loading...</div>;

  return (
    <>
      {isAuthenticated ? (
        isHeaderlessRoute ? (
          <Routes>
            {basicRoutes.map(({ path, element }) => (
              <Route
                key={path}
                element={<PrivateRoute isAuthenticated={isAuthenticated} />}
              >
                <Route path={path} element={element} />
              </Route>
            ))}

            {accessBasedRoutes.map(({ path, element }) => (
              <Route
                key={path}
                element={<PrivateRoute isAuthenticated={isAuthenticated} />}
              >
                <Route path={path} element={element} />
              </Route>
            ))}
          </Routes>
        ) : (
          <Layout isAuthenticated={isAuthenticated} />
        )
      ) : (
        <Login />
      )}
    </>
  );
};

export default App;
