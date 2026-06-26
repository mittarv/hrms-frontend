import { ClickAwayListener } from "@mui/material"; 
import sort_grey_icon from "../../assets/icons/sort_grey_icon.svg";
import tick_icon from "../../assets/icons/tick_icon.svg";
import "../styles/Sort.scss";

const Sort = ({ options, currentSort, onSortSelect, isOpen, setIsOpen, title }) => {
    const hasTitle = Boolean(title && String(title).trim());

   const handleSortClick = (clickedKey) => {
        let newSortKey;
        
        if (currentSort === clickedKey) {
            newSortKey = "none";
        } else {
            newSortKey = clickedKey;
        }

        onSortSelect(newSortKey);
        
    };
    return (
        
        <ClickAwayListener onClickAway={() => setIsOpen(false)}> 
            <div className="sort-container">
                {hasTitle ? (
                    <button
                        type="button"
                        className={`sort-button-label ${isOpen || (currentSort && currentSort !== "none") ? "active" : ""}`}
                        onClick={() => setIsOpen((prev) => !prev)}
                    >
                        <img src={sort_grey_icon} alt="Sort" className="sort-title-icon" />
                        <span>{title}</span>
                    </button>
                ) : (
                    <div className={`filter-button ${isOpen || (currentSort && currentSort !== "none") ? "active" : ""}`} onClick={() => setIsOpen(prev => !prev)}>
                        <img src={sort_grey_icon} alt="Sort" />
                    </div>
                )}
                
                {isOpen && (
                    <div className="dropdown-menu sort-menu">
                        {options.map((option) => (
                            <div 
                                key={option.key} 
                                className={`dropdown-item ${currentSort === option.key ? 'selected' : ''}`}
                                onClick={() => handleSortClick(option.key)}
                            >
                                {option.label}
                                {currentSort === option.key && (
                                    <img src={tick_icon} alt="tick"/>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ClickAwayListener>
    );
};
 export default Sort;
