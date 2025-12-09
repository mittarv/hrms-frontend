import { useNavigate } from "react-router-dom";
import "./PageNotFound.scss";

const PageNotFound = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="page-not-found">
      <div className="content">
        <h1 className="error-code">404</h1>
        <h2 className="error-title">Page Not Found</h2>
        <p className="error-message">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <button className="home-button" onClick={handleGoBack}>
          Go Back
        </button>
      </div>
    </div>
  );
};

export default PageNotFound;
