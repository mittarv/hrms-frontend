import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Dropdown_Arrow from "../../assets/icons/dropdow_arrow.svg";
import '../styles/CurrencyInput.scss';

const CurrencyInput = ({ 
  name, 
  value, 
  onChange, 
  countries, 
  selectedCountry, 
  onCountryChange, 
  placeholder,
  disabled = false,
  error = false 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState('below');
  const [scrollTop, setScrollTop] = useState(0);
  
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const optionsContainerRef = useRef(null);

  // Virtualization constants
  const ITEM_HEIGHT = 44; // Height of each option in pixels
  const CONTAINER_HEIGHT = 160; // Max height of visible area
  const VISIBLE_ITEMS = Math.ceil(CONTAINER_HEIGHT / ITEM_HEIGHT);
  const BUFFER_SIZE = 3; // Extra items to render for smooth scrolling

  // Memoized filtered countries to avoid unnecessary re-computations
  const filteredCountries = useMemo(() => {
    if (!searchTerm) {
      return countries || [];
    }
    return (countries || []).filter(country => 
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, countries]);

  // Calculate visible items for virtualization
  const visibleItems = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE);
    const endIndex = Math.min(
      filteredCountries.length - 1,
      startIndex + VISIBLE_ITEMS + (BUFFER_SIZE * 2)
    );
    
    return {
      startIndex,
      endIndex,
      items: filteredCountries.slice(startIndex, endIndex + 1)
    };
  }, [filteredCountries, scrollTop, VISIBLE_ITEMS, BUFFER_SIZE]);

  // Calculate dropdown position
  const calculateDropdownPosition = useCallback(() => {
    if (!containerRef.current) return 'below';
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const mainContainer = document.querySelector('.employee_onboarding_form_main_container');
    
    if (!mainContainer) return 'below';
    
    const mainContainerRect = mainContainer.getBoundingClientRect();
    const dropdownHeight = 200; // max-height of dropdown
    
    const spaceBelow = mainContainerRect.bottom - containerRect.bottom;
    const spaceAbove = containerRect.top - mainContainerRect.top;
    
    // If there's not enough space below but enough space above, position above
    if (spaceBelow < dropdownHeight && spaceAbove >= dropdownHeight) {
      return 'above';
    }
    
    return 'below';
  }, []);

  // Handle scroll events for virtualization
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setSearchTerm("");
        setScrollTop(0); // Reset scroll position
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = useCallback(() => {
    if (disabled) return;
    
    if (isDropdownOpen) {
      setIsDropdownOpen(false);
      setSearchTerm("");
      setScrollTop(0); // Reset scroll position
    } else {
      setIsDropdownOpen(true);
      const position = calculateDropdownPosition();
      setDropdownPosition(position);
    }
  }, [disabled, isDropdownOpen, calculateDropdownPosition]);

  const handleCountrySelect = useCallback((country) => {
    onCountryChange(country);
    setIsDropdownOpen(false);
    setSearchTerm("");
    setScrollTop(0); // Reset scroll position
  }, [onCountryChange]);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
    setScrollTop(0); // Reset scroll when searching
  }, []);

  const handleInputChange = useCallback((e) => {
    onChange({
      target: {
        name: name,
        value: e.target.value,
        type: 'number'
      }
    });
  }, [onChange, name]);

  return (
    <div className="currency-input-container" ref={containerRef}>
      <div className="currency-input-wrapper">
        <div
          className={`currency-selector ${disabled ? 'disabled' : ''}`}
          onClick={toggleDropdown}
        >
          {selectedCountry && (
            <>
              <span className="country-flag">
                <img src={selectedCountry.flag} alt={selectedCountry.name} />
              </span>
              <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>
                <img src={Dropdown_Arrow} alt="Dropdown Arrow" style={{ width: '10px', height: '10px' }} />
              </span>
            </>
          )}
        </div>
        <input
          type="number"
          name={name}
          value={value || ""}
          onChange={handleInputChange}
          className={`currency-input ${error ? 'error' : ''}`}
          placeholder={placeholder}
          disabled={disabled}
        />
        {selectedCountry && (
          <span className="currency-symbol">{selectedCountry.currencySymbol}.</span>
        )}
      </div>

      {isDropdownOpen && (
        <div 
          className={`currency-dropdown ${dropdownPosition === 'above' ? 'position-above' : 'position-below'}`}
          ref={dropdownRef}
        >
          <div className="currency-search-container">
            <input
              type="text"
              className="currency-search-input"
              placeholder="Search countries..."
              value={searchTerm}
              onChange={handleSearchChange}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
          <div 
            className="currency-options-container virtualized"
            ref={optionsContainerRef}
            onScroll={handleScroll}
            style={{ height: CONTAINER_HEIGHT }}
          >
            {filteredCountries.length > 0 ? (
              <div 
                className="virtual-list"
                style={{ 
                  height: filteredCountries.length * ITEM_HEIGHT,
                  position: 'relative'
                }}
              >
                {visibleItems.items.map((country, index) => {
                  const actualIndex = visibleItems.startIndex + index;
                  return (
                    <div
                      key={country.key}
                      className="currency-option"
                      style={{
                        position: 'absolute',
                        top: actualIndex * ITEM_HEIGHT,
                        height: ITEM_HEIGHT,
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      onClick={() => handleCountrySelect(country)}
                    >
                      <span className="country-flag">
                        <img 
                          src={country.flag} 
                          alt={country.name}
                          loading="lazy" // Lazy load images for better performance
                        />
                      </span>
                      <span className="currency-symbol">{country.currencySymbol}</span>
                      <span className="country-name">{country.name}</span>
                      <span className="currency-code">({country.currency})</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-results">
                No countries found matching &quot;{searchTerm}&quot;
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencyInput;

/* 
Usage Example:

<CurrencyInput
  name="amount"                      // Input name attribute
  value={amount}                     // Current input value
  onChange={handleAmountChange}      // Input change handler
  countries={countriesData}          // Array of country objects
  selectedCountry={selectedCountry}  // Currently selected country
  onCountryChange={handleCountryChange} // Country selection handler
  placeholder="Enter amount"         // Input placeholder (optional)
  disabled={false}                   // Disabled state (optional)
  error={false}                     // Error state (optional)
/>

Country object format:
{
  key: "unique-key",
  name: "Country Name",
  currency: "CURRENCY_CODE",
  currencySymbol: "$",
  flag: "path/to/flag.png",
  code: "CC"
}
*/
