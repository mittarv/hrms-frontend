import {  useState, useMemo } from "react";
import { ClickAwayListener } from "@mui/material";
import dropdown_arrow from "../../../../../assets/icons/dropdown_arrow.svg";
import divider from "../../../../../assets/icons/divider_icon.svg";
import filter_grey_icon from "../../../../../assets/icons/filter_grey_icon.svg";
import tick_icon from "../../../../../assets/icons/tick_icon.svg";
import searchIcon from "../../../../../assets/icons/Search_icon_grey.svg";
import "./Filter.scss"
const Filter = ({
  title,
  options,
  selected,
  onSelect,
  showSearch = true,
  showTitleIcon = false,
  showCount = true,
}) => {
  

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectedValues = Array.isArray(selected) ? selected : [];
  const activeCount = selectedValues.length;
  const hasTitle = Boolean(title && String(title).trim());

 
  const listOptions = useMemo(() => {
    if (Array.isArray(options)) {
      return options.map((option) => ({
        key: option?.key,
        label: option?.label,
      }));
    }

    return Object.entries(options || {}).map(([key, value]) => ({
      key,
      label: value,
    }));
  }, [options]);

  const filteredOptions = useMemo(() => {
    if (!searchTerm) {
      return listOptions;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return listOptions.filter(option =>
      String(option.label || "").toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [listOptions, searchTerm]);
 

  const handleOptionClick = (key) => {
   
    onSelect(key);
  };

  const toggleDropdown = () => {
    setIsOpen((prev) => {
      if (prev) {
        setSearchTerm("");
      }
      return !prev;
    });
  };

  return (
    <ClickAwayListener onClickAway={() => setIsOpen(false)}>
      <div
        className={`filter-dropdown-container ${
          activeCount > 0 ? "active" : ""
        } ${isOpen ? "open" : ""} ${hasTitle ? "" : "icon-mode"}`}
      >
        <button
          type="button"
          className={hasTitle ? "filter-button-label" : "filter-button-icon"}
          onClick={toggleDropdown}
        >
          {hasTitle ? (
            <>
              {showTitleIcon && <img src={filter_grey_icon} alt="Filter" className="filter-title-icon" />}
              <p>{showCount && activeCount > 0 && <span>{activeCount}</span>} {title} </p>
              <img
                src={dropdown_arrow}
                alt="Dropdown"
                className={`dropdown-arrow-icon ${isOpen ? "rotated" : ""}`}
              />
            </>
          ) : (
            <>
              <img src={filter_grey_icon} alt="Filter" className="filter-icon" />
              {activeCount > 0 && <span className="active-count-badge">{activeCount}</span>}
            </>
          )}
        </button>
        {isOpen && (
          <div className="dropdown-menu">
            {showSearch && (
              <div className="search-input-container">
                <img src={searchIcon} alt="Search"/>
                <img src={divider} alt="Divider"/>
                <input
                  type="text"
                  placeholder="Start Searching"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="dropdown-search-input" 
                  onClick={(e) => e.stopPropagation()} 
                />
              </div>
            )}

            
            {filteredOptions.length > 0 ? (
              <div className="dropdown-options-list">
                {filteredOptions.map((option) => (
                  <div
                    key={option.key}
                    className={`dropdown-item ${
                      selectedValues.includes(option.key) ? "selected" : ""
                    }`}
                    onClick={() => handleOptionClick(option.key)}
                  >
                      {option.label}
                    {selectedValues.includes(option.key) && <img src={tick_icon} alt="Selected" />}
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