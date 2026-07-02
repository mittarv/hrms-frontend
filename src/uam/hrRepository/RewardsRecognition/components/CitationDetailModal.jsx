import { useEffect } from "react";
import Cross_icon from "../../assets/icons/cross_icon.svg";
import links_icon from "../../assets/icons/links.svg";
import "../styles/CitationDetailModal.scss";

const CitationDetailModal = ({
  isOpen,
  onClose,
  name,
  department,
  citation,
  nominators,
  title = "Citation",
}) => {
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const copyText = `"${(citation || "").trim()}"${nominators ? ` - ${nominators}` : ""}`;

  return (
    <div className="citation_detail_modal_overlay" onClick={onClose}>
      <div
        className="citation_detail_modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="citation_detail_modal_header">
          <div className="citation_detail_modal_title_block">
            <span className="citation_detail_modal_name">{name || "—"}</span>
            {department && (
              <span className="citation_detail_modal_meta">{department}</span>
            )}
          </div>
          <button
            type="button"
            className="citation_detail_modal_close"
            onClick={onClose}
          >
            <img src={Cross_icon} alt="close" />
          </button>
        </div>
        <div className="citation_detail_modal_content">
          <div className="citation_detail_modal_list_header">
            <h3>{title}</h3>
            <button
              type="button"
              className="citation_detail_modal_copy_btn"
              onClick={() => {
                if (copyText && navigator.clipboard?.writeText) {
                  navigator.clipboard.writeText(copyText);
                }
              }}
            >
              <img
                src={links_icon}
                alt=""
                className="citation_detail_modal_copy_icon"
              />
              Copy Citation
            </button>
          </div>
          <div className="citation_detail_modal_list">
            <div className="citation_detail_modal_item">
              <p className="citation_detail_modal_quote">
                &ldquo;{citation || ""}&rdquo;
              </p>
              {nominators && (
                <span className="citation_detail_modal_author">
                  &ndash; {nominators}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitationDetailModal;