import { useEffect, useMemo, useRef, useState } from "react";
import ViewMoreModal from "./ViewMoreModal";

const ViewMoreText = ({
  text,
  maxLength = 45,
  modalTitle = "Details",
  emptyValue = "-",
  textClassName = "",
  buttonClassName = "",
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTextOverflowing, setIsTextOverflowing] = useState(false);
  const textRef = useRef(null);

  const normalizedText = useMemo(() => {
    if (text === null || text === undefined) return "";
    return String(text).trim();
  }, [text]);

  const shouldTruncateByLength = normalizedText.length > maxLength;
  const previewText = shouldTruncateByLength
    ? `${normalizedText.slice(0, maxLength).trimEnd()}...`
    : normalizedText;

  useEffect(() => {
    if (!normalizedText) {
      setIsTextOverflowing(false);
      return undefined;
    }

    const element = textRef.current;
    if (!element) {
      setIsTextOverflowing(false);
      return undefined;
    }

    const checkOverflow = () => {
      const hasHorizontalOverflow = element.scrollWidth > element.clientWidth + 1;
      const hasVerticalOverflow = element.scrollHeight > element.clientHeight + 1;
      setIsTextOverflowing(hasHorizontalOverflow || hasVerticalOverflow);
    };

    checkOverflow();

    let resizeObserver;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(checkOverflow);
      resizeObserver.observe(element);
    }

    window.addEventListener("resize", checkOverflow);
    return () => {
      window.removeEventListener("resize", checkOverflow);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [normalizedText, previewText]);

  const shouldShowViewMore = shouldTruncateByLength || isTextOverflowing;

  if (!normalizedText) {
    return <span className={textClassName}>{emptyValue}</span>;
  }

  return (
    <div className="view-more-inline-wrap">
      <span ref={textRef} className={textClassName}>{previewText}</span>
      {shouldShowViewMore && (
        <button
          type="button"
          className={`view-more-inline-btn ${buttonClassName}`.trim()}
          onClick={() => setIsModalOpen(true)}
        >
          View more
        </button>
      )}

      <ViewMoreModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
        content={normalizedText}
      />
    </div>
  );
};

export default ViewMoreText;
