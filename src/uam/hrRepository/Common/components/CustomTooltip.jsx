import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import "../styles/CustomTooltip.scss";

/**
 * Displays text truncated by word count. On hover (no delay), shows full text (or custom tooltipContent) in a custom-styled tooltip.
 * Click on the citation to pin the tooltip (stays open so you can scroll); click outside to close.
 * @param {string} text - Full text to display (truncated if long)
 * @param {number} maxWords - Max words to show before truncation (default 20)
 * @param {string} [tooltipContent] - Optional. When provided, tooltip shows this instead of full text and hover is always enabled.
 * @param {string} className - Optional CSS class for the wrapper
 * @param {string} emptyLabel - Text to show when text is empty (default "—")
 * @param {boolean} fullWidth - If true, trigger fills container (e.g. table cell) so tooltip centers in it
 */
const CustomTooltip = ({ text, maxWords = 20, tooltipContent, className = "", emptyLabel = "—", fullWidth = false }) => {
  const [tooltip, setTooltip] = useState(null);
  const [pinned, setPinned] = useState(false);
  const triggerRef = useRef(null);
  const bubbleRef = useRef(null);

  const updatePosition = () => {
    if (triggerRef.current && typeof window !== "undefined") {
      const rect = triggerRef.current.getBoundingClientRect();
      const minSpaceAbove = 24;
      const showAbove = rect.top > minSpaceAbove + 200;
      const bubbleHalfMax = 200;
      const padding = 16;
      const triggerCenterX = rect.left + rect.width / 2;
      const left = Math.max(
        padding + bubbleHalfMax,
        Math.min(window.innerWidth - padding - bubbleHalfMax, triggerCenterX)
      );
      setTooltip({
        top: rect.top,
        bottom: rect.bottom,
        left,
        showAbove,
      });
    }
  };

  const handleMouseEnter = () => {
    updatePosition();
  };

  const handleMouseLeave = () => {
    if (!pinned) setTooltip(null);
  };

  const handleTriggerClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (tooltip) {
      setPinned(true);
    }
  };

  useEffect(() => {
    if (!pinned || !tooltip) return;
    const handleClickOutside = (e) => {
      const target = e.target;
      if (
        triggerRef.current?.contains(target) ||
        bubbleRef.current?.contains(target)
      ) {
        return;
      }
      setPinned(false);
      setTooltip(null);
    };
    document.addEventListener("mousedown", handleClickOutside, true);
    return () => document.removeEventListener("mousedown", handleClickOutside, true);
  }, [pinned, tooltip]);

  const wrapperClass = `custom_tooltip_wrapper ${fullWidth ? "custom_tooltip_full_width" : ""} ${className}`.trim();

  if (text == null || String(text).trim() === "") {
    return <span className={wrapperClass}>{emptyLabel}</span>;
  }

  const str = String(text).trim();
  const words = str.split(/\s+/).filter(Boolean);
  const isLong = words.length > maxWords;
  const displayText = isLong ? words.slice(0, maxWords).join(" ") + "…" : str;
  const bubbleContent = tooltipContent != null && String(tooltipContent).trim() !== "" ? String(tooltipContent).trim() : str;
  const showTooltipOnHover = isLong || tooltipContent != null;

  if (!showTooltipOnHover) {
    return <span className={wrapperClass}>{str}</span>;
  }

  const tooltipEl = tooltip && (
    <div
      ref={bubbleRef}
      className={`custom_tooltip_bubble ${tooltip.showAbove ? "custom_tooltip_above" : "custom_tooltip_below"} ${pinned ? "custom_tooltip_pinned" : ""}`}
      style={{
        position: "fixed",
        left: tooltip.left,
        ...(tooltip.showAbove
          ? { top: tooltip.top - 8, transform: "translate(-50%, -100%)" }
          : { top: tooltip.bottom + 8, transform: "translate(-50%, 0)" }),
      }}
      role="tooltip"
    >
      <div className="custom_tooltip_content">{bubbleContent}</div>
      <div className="custom_tooltip_arrow" />
    </div>
  );

  return (
    <>
      <span
        ref={triggerRef}
        className={`${wrapperClass} custom_tooltip_truncated`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleTriggerClick}
      >
        {displayText}
      </span>
      {typeof document !== "undefined" && createPortal(tooltipEl, document.body)}
    </>
  );
};

export default CustomTooltip;
