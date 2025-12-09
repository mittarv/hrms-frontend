import { useState, useRef, useEffect } from "react";
import "../styles/Tooltip.scss"; 
const Tooltip = ({ children, content }) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState("top");
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (visible && tooltipRef.current) {
      const tooltipBox = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;

      if (tooltipBox.right > viewportWidth) {
        setPosition("left");
      } else if (tooltipBox.left < 0) {
        setPosition("right");
      } else if (tooltipBox.top < 0) {
        setPosition("bottom");
      } else {
        setPosition("top");
      }
    }
  }, [visible]);

  return (
    <div
      className="tooltip-container"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div ref={tooltipRef} className={`tooltip-box tooltip-${position}`}>
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;