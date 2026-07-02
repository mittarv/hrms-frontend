import { useEffect } from "react";
import Close_icon from "../../assets/icons/close_icon.svg";
import "../styles/ViewMoreModal.scss";

const ViewMoreModal = ({
  isOpen = false,
  onClose,
  title = "Details",
  content = "",
}) => {
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="view_more_modal_overlay" onClick={() => onClose?.()}>
      <div
        className="view_more_modal_container"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="view_more_modal_header">
          <h3>{title}</h3>
          <button type="button" onClick={() => onClose?.()} aria-label="Close">
            <img src={Close_icon} alt="close_icon" />
          </button>
        </div>

        <div className="view_more_modal_content">{content || "-"}</div>
      </div>
    </div>
  );
};

export default ViewMoreModal;
