import ReactDOM from "react-dom/client";
import "./index.scss";
import App from "./App";
import HrApp from "./uam/hrRepository/HrApp";
import { BrowserRouter, useLocation } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { pdfjs } from "react-pdf";

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
