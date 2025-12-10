import { ClickAwayListener } from "@mui/material"; 
import sort_grey_icon from "../../../../assets/icons/sort_grey_icon.svg";
import tick_icon from "../../../../assets/icons/tick_icon.svg";
import "../styles/Sort.scss";

const Sort = ({ options, currentSort, onSortSelect, isOpen, setIsOpen }) => {

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
                <button className="filter-button" onClick={() => setIsOpen(prev => !prev)}>
                    <img src={sort_grey_icon} alt="Sort" />
                </button>
                
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
