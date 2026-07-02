import "../styles/NoResultsContainer.scss";
import noResultsImg from "../../assets/icons/no_results_icon.svg";


/**
 * A reusable component for displaying "no results" or "no data" messages
 * 
 * @param {Object} props
 * @param {string|React.ReactNode} props.message - Primary message to display (required)
 * @param {string|React.ReactNode} [props.subMessage] - Optional secondary message or element
 * @param {boolean} [props.showImage=false] - Whether to show the no results image
 * @param {string} [props.className] - Optional additional CSS class name
 */
const NoResultsContainer = ({ 
  message, 
  subMessage, 
  showImage = false, 
  image = noResultsImg,
  className = "",
  border=true,
}) => {
  return (
    <div className={`no-results-container ${className}`} style={{ border: border ? "1px solid #e4e7ec" : "none" }}>
      {showImage && (
        <img
          src={image}
          alt="No results"
          className="no-results-image"
        />
      )}
      <p className="no-results-text">{message}</p>
      {subMessage && (
        <div className="no-results-subtext">{subMessage}</div>
      )}
    </div>
  );
};

export default NoResultsContainer;
