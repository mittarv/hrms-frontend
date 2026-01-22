import { useNavigate } from "react-router-dom";
import "./AccessDenied.scss";
import ExclamationIcon from "../../assets/icons/exclamation_mark.svg";

const AccessDenied = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="access_denied_container">
      <div className="access_denied_content">
        <div className="access_denied_icon_wrapper">
          <img src={ExclamationIcon} alt="Access Denied" className="access_denied_icon" />
        </div>
        <h1 className="access_denied_title">Access Denied</h1>
        <p className="access_denied_message">
          You don't have permission to access this page.
        </p>
        <p className="access_denied_submessage">
          Please contact your administrator if you believe this is an error.
        </p>
        <div className="access_denied_actions">
          <button className="access_denied_button secondary" onClick={handleGoBack}>
            Go Back
          </button>
          <button className="access_denied_button primary" onClick={handleGoToDashboard}>
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
