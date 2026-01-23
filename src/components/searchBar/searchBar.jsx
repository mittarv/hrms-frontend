import React from 'react';
import './searchBar.scss';
import search from '../../assets/icons/search_icon.svg';

const SearchBar = ({ onSearch }) => {
  return (
    <div className="search-bar-container">
      <div className="search-input-wrapper">
        <img src={search} className="search-icon" alt="Search Icon" />
        <input
          type="text"
          className="search-bar"
          placeholder="Search by attribute or value"
          onChange={onSearch}
        />
      </div>
    </div>
  );
};

export default SearchBar;
