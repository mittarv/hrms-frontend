import ReactDOM from "react-dom/client";
import "./index.scss";
import App from "./App";
import HrApp from "./uam/hrRepository/HrApp";
import { BrowserRouter, useLocation } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { pdfjs } from "react-pdf";
import axios from "axios";
import { getToken } from "./utils/authStorage";
import { extractSubdomainFromHostname } from "./utils/domainUtils";

// Setup global axios interceptor — attaches auth token and tenant header to every request
axios.interceptors.request.use((config) => {
  // Auth token from shared cookie
  const token = getToken();
  if (token) {
    config.headers["Authorization"] = token;
  }
  // Tenant subdomain from hostname (e.g., "hora4.lvh.me" → "hora4")
  const subdomain = extractSubdomainFromHostname();
  if (subdomain) {
    config.headers["x-tenant-subdomain"] = subdomain;
  }
  return config;
});

// Intercept responses to handle tenant inactive specifically
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403 && error.response?.data?.code === "TENANT_INACTIVE") {
      if (window.location.pathname !== '/org-inactive') {
        window.location.href = '/org-inactive';
      }
    }
    return Promise.reject(error);
  }
);

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;

const RootApp = () => {
  const location = useLocation();
  
  const isHrRoute = [
    "/hr-repo",
    "/dashboard",
    "/policies",
    "/imp-link",
    "/employee-repo",
    "/employee-directory",
    "/leave-configurator",
    "/leave-attendance",
    "/hr-repo-requests",
    "/payroll-reimbursements",
    "/hrms-access",
    "/secondary-working-location",
    "/rewards-recognitions",
    "/rewards-recognitions/vote",
    "/employee-type-configurator",
  ].some((path) => location.pathname === path);

  return isHrRoute ? <HrApp /> : <App />;
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <BrowserRouter>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_REACT_APP_GOOGLE_CLIENT_ID}>
        <RootApp />
      </GoogleOAuthProvider>
    </BrowserRouter>
  </Provider>
);
