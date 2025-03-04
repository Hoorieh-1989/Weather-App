import React from 'react';

const SearchBar = ({ value, onChange, onSearch }) => {
  const handleSearch = (e) => {
    e.preventDefault();
    if (value.trim() !== '') {
      onSearch(value);
    }
  };

  return (
    <div className="search-bar-container">
      <form onSubmit={handleSearch} className="search-form">
        <input 
          type="text" 
          value={value}
          onChange={onChange}
          placeholder="Search city..." 
          className="search-input"
        />
        <button type="submit" className="search-button">Search</button>
      </form>
    </div>
  );
};

export default SearchBar;
