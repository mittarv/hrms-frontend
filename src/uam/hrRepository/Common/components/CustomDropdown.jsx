import { useState, useEffect, useRef } from 'react';
import Dropdown_Arrow from '../../assets/icons/dropdow_arrow.svg';
import Tick_Icon from '../../assets/icons/tick_icon.svg';
import '../styles/CustomDropdown.scss';

const CustomDropdown = ({
  options = [],
  value = "",
  onChange,
  placeholder = "Select an option",
  fieldName,
  error = false,
  disabled = false,
  onCreateNew = null,
  searchable = false,
  className = "",
  allowClearSelection = false,
  clearOptionLabel = "None",
  deselectOnReselect = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState('below');
  const [dropdownMaxHeight, setDropdownMaxHeight] = useState(200);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Filter options based on search term
  const filteredOptions = searchable
    ? options.filter((option) =>
        String(option?.value || "").toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const resolvedValue = String(value || "");
  const renderedOptions = allowClearSelection
    ? [{ value: clearOptionLabel, isClearOption: true }, ...filteredOptions]
    : filteredOptions;

  // Calculate dropdown position and height
  const calculateDropdownPosition = () => {
    if (!triggerRef.current) return 'below';
    
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const defaultDropdownHeight = 200; // Default max-height of dropdown
    const buffer = 20; // Buffer from viewport edges
    
    // Get viewport dimensions
    const viewportHeight = window.innerHeight;
    
    // Calculate available space below and above
    const spaceBelow = viewportHeight - triggerRect.bottom - buffer;
    const spaceAbove = triggerRect.top - buffer;
    
    let position = 'below';
    let maxHeight = defaultDropdownHeight;
    
    // If there's not enough space below and there's more space above, position above
    if (spaceBelow < defaultDropdownHeight && spaceAbove > spaceBelow) {
      position = 'above';
      maxHeight = Math.min(defaultDropdownHeight, spaceAbove);
    } else {
      // Position below but adjust height if needed
      maxHeight = Math.min(defaultDropdownHeight, spaceBelow);
    }
    
    // Ensure minimum height
    maxHeight = Math.max(maxHeight, 100);
    
    setDropdownMaxHeight(maxHeight);
    return position;
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
        setShouldAutoScroll(false);
      }
    };

    const handleResize = () => {
      if (isOpen) {
        const position = calculateDropdownPosition();
        setDropdownPosition(position);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 100);
    }
  }, [isOpen, searchable]);

  // Auto-scroll to highlighted option
  useEffect(() => {
    if (highlightedIndex >= 0 && isOpen && shouldAutoScroll) {
      const optionsContainer = dropdownRef.current?.querySelector('.dropdown-options');
      const highlightedOption = optionsContainer?.querySelector('.dropdown-option.highlighted');
      
      if (highlightedOption && optionsContainer) {
        const optionTop = highlightedOption.offsetTop;
        const optionHeight = highlightedOption.offsetHeight;
        const containerScrollTop = optionsContainer.scrollTop;
        const containerHeight = optionsContainer.offsetHeight;
        
        // Scroll down if option is below visible area
        if (optionTop + optionHeight > containerScrollTop + containerHeight) {
          optionsContainer.scrollTop = optionTop + optionHeight - containerHeight;
        }
        // Scroll up if option is above visible area
        else if (optionTop < containerScrollTop) {
          optionsContainer.scrollTop = optionTop;
        }
      }
      
      // Reset the auto-scroll flag after scrolling
      setShouldAutoScroll(false);
    }
  }, [highlightedIndex, isOpen, shouldAutoScroll]);

  const toggleDropdown = () => {
    if (disabled) return;
    
    if (!isOpen) {
      const position = calculateDropdownPosition();
      setDropdownPosition(position);
      setHighlightedIndex(-1); // Reset highlighted index when opening
      setShouldAutoScroll(false); // Reset auto-scroll flag
    } else {
      setHighlightedIndex(-1); // Reset when closing
      setShouldAutoScroll(false); // Reset auto-scroll flag
    }
    
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm('');
    }
  };

  const handleOptionSelect = (option) => {
    if (option.disabled) return;

    const shouldClearSelection =
      option?.isClearOption || (deselectOnReselect && resolvedValue && resolvedValue === option?.value);
    
    if (option.value === "Create New Level" && onCreateNew) {
      onCreateNew();
    } else {
      onChange({
        target: {
          name: fieldName,
          value: shouldClearSelection ? "" : option.value,
          type: 'select'
        }
      });
    }
    
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
    setShouldAutoScroll(false);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setHighlightedIndex(-1); // Reset highlighted index when searching
    setShouldAutoScroll(false); // Reset auto-scroll flag when searching
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      // If dropdown is closed, open it on Enter or Arrow keys
      if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const position = calculateDropdownPosition();
        setDropdownPosition(position);
        setIsOpen(true);
        setHighlightedIndex(0); // Highlight first option
      }
      return;
    }

    // Handle keyboard navigation when dropdown is open
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
        setShouldAutoScroll(false);
        break;
        
      case 'ArrowDown':
        e.preventDefault();
        setShouldAutoScroll(true);
        setHighlightedIndex(prev => {
          const maxIndex = renderedOptions.length - 1;
          return prev < maxIndex ? prev + 1 : 0; // Loop back to first
        });
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setShouldAutoScroll(true);
        setHighlightedIndex(prev => {
          const maxIndex = renderedOptions.length - 1;
          return prev > 0 ? prev - 1 : maxIndex; // Loop to last
        });
        break;
        
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < renderedOptions.length) {
          handleOptionSelect(renderedOptions[highlightedIndex]);
        }
        break;
        
      default:
        break;
    }
  };

  return (
    <div className={`custom-dropdown-container ${className}`} ref={dropdownRef}>
      <div 
        ref={triggerRef}
        className={`custom-dropdown-trigger ${error ? "error" : ""} ${disabled ? "disabled" : ""}`}
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        data-dropdown-field={fieldName}
        data-state={isOpen ? "open" : "closed"}
        style={{
          cursor: disabled ? "not-allowed" : "pointer", 
          fontFamily: "Plus Jakarta Sans"
        }}
      >
        <span className={resolvedValue ? "selected-value" : "placeholder"}>
          {resolvedValue || placeholder}
        </span>
        <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>
          <img src={Dropdown_Arrow} alt="Dropdown Arrow" style={{ width: '12px', height: '12px' }} />
        </span>
      </div>
      
      {isOpen && !disabled && (
        <div 
          className={`custom-dropdown-menu ${dropdownPosition === 'above' ? 'position-above' : 'position-below'}`}
          style={{ maxHeight: `${dropdownMaxHeight}px` }}
        >
          {searchable && (
            <div className="dropdown-search">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search options..."
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                className="search-input"
              />
            </div>
          )}
          
          <div 
            className="dropdown-options"
            role="listbox"
            style={{ 
              maxHeight: searchable ? `${dropdownMaxHeight - 60}px` : `${dropdownMaxHeight - 20}px` 
            }}
          >
            {renderedOptions.length > 0 ? (
              renderedOptions.map((option, index) => {
                const optionValue = String(option?.value || "");
                const isSelected = option?.isClearOption
                  ? !resolvedValue
                  : resolvedValue === optionValue;

                return (
                <div
                  key={`${optionValue}-${index}`}
                  className={`dropdown-option ${option?.disabled ? 'disabled' : ''} ${isSelected ? 'selected' : ''} ${index === highlightedIndex ? 'highlighted' : ''}`}
                  onClick={() => handleOptionSelect(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  style={{cursor: option?.disabled ? 'not-allowed' : 'pointer'}}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span className="dropdown-option-label">{optionValue}</span>
                  {isSelected ? (
                    <img
                      src={Tick_Icon}
                      alt="selected"
                      className="dropdown-option-check"
                    />
                  ) : (
                    <span className="dropdown-option-check-placeholder" aria-hidden="true" />
                  )}
                </div>
              );
            })
            ) : searchable && searchTerm ? (
              <div className="no-results">No options found</div>
            ) : null}
          </div>
        </div>
      )}
    </div>
    
  );
};

export default CustomDropdown;
