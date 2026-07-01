import { useNavigate } from "react-router-dom";
import "../styles/AccessDenied.scss";
import ExclamationIcon from "../../assets/icons/exclamation_mark.svg";

const AccessDenied = ({ 
  message = "You don't have permission to access this page.",
  submessage = "Please contact your administrator if you believe this is an error.",
  showGoBack = true,
  showDashboardButton = true,
  extraAction = null,
}) => {
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
          {message}
        </p>
        <p className="access_denied_submessage">
          {submessage}
        </p>
        <div className="access_denied_actions">
          {showGoBack && (
            <button className="access_denied_button secondary" onClick={handleGoBack}>
              Go Back
            </button>
          )}
          {extraAction && (
            <button className="access_denied_button primary" onClick={extraAction.onClick}>
              {extraAction.label}
            </button>
          )}
          {showDashboardButton && (
            <button className="access_denied_button primary" onClick={handleGoToDashboard}>
              Go to Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
