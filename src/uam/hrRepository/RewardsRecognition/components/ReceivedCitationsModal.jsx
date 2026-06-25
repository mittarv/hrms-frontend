import { useCallback, useState } from "react";
import Cross_icon from "../../assets/icons/cross_icon.svg";
import links_icon from "../../assets/icons/links.svg";
import "../styles/ReceivedCitationsModal.scss";

const ReceivedCitationsModal = ({ citations = [], monthYear, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopyAll = useCallback(() => {
    const text = citations
      .map((c) => `"${(c.citation || "").trim()}" - ${c.nominatedBy || ""}`)
      .join("\n\n");
    if (text && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    }
  }, [citations]);

  const handleCopySingle = useCallback((citation, author, index) => {
    const text = `"${(citation || "").trim()}" - ${author || ""}`;
    if (text && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  }, []);

  return (
    <div className="received_citations_modal_overlay" onClick={onClose}>
      <div
        className="received_citations_modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="received_citations_modal_header">
          <div className="received_citations_modal_title_block">
            <span className="received_citations_modal_title">
              Received Citations
            </span>
            <span className="received_citations_modal_month_year">
              {monthYear}
            </span>
          </div>
          <button
            type="button"
            className="received_citations_modal_close_icon"
            onClick={onClose}
          >
            <img src={Cross_icon} alt="close" />
          </button>
        </div>
        <div className="received_citations_modal_content">
          <div className="received_citations_modal_list_header">
            <h3>All Citations ({citations.length})</h3>
            <button
              type="button"
              className="received_citations_copy_btn"
              onClick={handleCopyAll}
            >
              <img
                src={links_icon}
                alt=""
                className="received_citations_copy_icon"
              />
              Copy Citations
            </button>
          </div>
          <div className="received_citations_modal_list">
            {citations.map((item, index) => (
              <div
                key={index}
                className={`received_citations_modal_item ${copiedIndex === index ? "copied" : ""}`}
                onClick={() =>
                  handleCopySingle(item.citation, item.nominatedBy, index)
                }
              >
                <p className="received_citations_modal_quote">
                  &ldquo;{item.citation || ""}&rdquo;
                </p>
                <span className="received_citations_modal_author">
                  &ndash; {item.nominatedBy || "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceivedCitationsModal;
