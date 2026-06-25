import {  useState, useMemo } from "react";
import { ClickAwayListener } from "@mui/material";
import dropdown_arrow from "../../../../../assets/icons/dropdown_arrow.svg";
import divider from "../../../../../assets/icons/divider_icon.svg";
import tick_icon from "../../../../../assets/icons/tick_icon.svg";
import searchIcon from "../../../../../assets/icons/Search_icon_grey.svg";
import "./Filter.scss"
const Filter = ({ title, options, selected, onSelect }) => {
  

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const activeCount = selected.length;

 
  const listOptions = Object.entries(options).map(([key, value]) => ({
    key,
    label: value,
  }));
  const filteredOptions = useMemo(() => {
    if (!searchTerm) {
      return listOptions;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return listOptions.filter(option =>
      option.label.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [listOptions, searchTerm]);
 

  const handleOptionClick = (key) => {
   
    onSelect(key);
  };

  return (
    <ClickAwayListener onClickAway={() => setIsOpen(false)}>
      <div
        className={`filter-dropdown-container ${
          activeCount > 0 ? "active" : ""
        }`}
      >
        <button
          className="filter-button-label"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <p>{activeCount > 0 && <span>{activeCount}</span>} {title} </p>

          
          <img
            src={dropdown_arrow}
            alt="Dropdown"
            className={`dropdown-arrow-icon ${isOpen ? "rotated" : ""}`}
          />
        </button>
        {isOpen && (
          <div className="dropdown-menu">
            <div className="search-input-container">
              <img src={searchIcon}/>
              <img src={divider}/>
              <input
                type="text"
                placeholder="Start Searching"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="dropdown-search-input" 
                onClick={(e) => e.stopPropagation()} 
              />
            </div>

            
            {filteredOptions.length > 0 ? (
              <div className="dropdown-options-list">
                {filteredOptions.map((option) => (
                  <div
                    key={option.key}
                    className={`dropdown-item ${
                      selected.includes(option.key) ? "selected" : ""
                    }`}
                    onClick={() => handleOptionClick(option.key)}
                  >
                    {option.label}
                    {selected.includes(option.key) && <img src={tick_icon} alt="Selected" />}
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <p>No results</p>
              </div>
            )}
          </div>
        )}
      </div>
    </ClickAwayListener>
  );
};
export default Filter;