import { useSelector, useDispatch } from "react-redux";
import "../styles/Snackbar.scss"; 
import Close_icon from "../../assets/icons/cross_icon.svg"
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const Snackbar = () => {
  const dispatch = useDispatch();
  const { message, severity, isOpen } = useSelector(
    (state) => state.hrRepositoryReducer
  );
  const location = useLocation();

  useEffect(() => {
    if (isOpen && message) {
      const timer = setTimeout(() => {
        dispatch({
          type: "CLEAR_NEW_SNACKBAR_MESSAGE",
        });
      }, 4000); 

      return () => clearTimeout(timer);
    }
  }, [isOpen, message, dispatch]);

  // Clear snackbar on route change
  useEffect(() => {
    if (isOpen) {
      dispatch({ type: "CLEAR_NEW_SNACKBAR_MESSAGE" });
    }
  }, [location.pathname, dispatch]);

  const handleClose = () => {
    dispatch({
      type: "CLEAR_NEW_SNACKBAR_MESSAGE",
    });
  };

  if (!isOpen || !message) return null;

  return (
    <div
      className={`snackbar snackbar--${severity} ${
        isOpen ? "snackbar--show" : ""
      }`}
    >
      <div className="snackbar__content">
        <span className="snackbar__message">{message}</span>
        <button
          className="snackbar__close"
          onClick={handleClose}
          aria-label="Close"
        >
          <img src={Close_icon} alt="Close" />
        </button>
      </div>
    </div>
  );
};

export default Snackbar;
