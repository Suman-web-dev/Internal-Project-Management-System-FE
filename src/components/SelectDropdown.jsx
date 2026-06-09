import React, { useState, useRef, useEffect, useCallback } from 'react';

// Single-select dropdown component - allows selecting one option from a list with infinite scrolling
const SelectDropdown = ({ label, options, selectedValue, onChange, placeholder = "Select an option", onLoadMore, hasMore = false, isLoading = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const listRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle infinite scrolling
  const handleScroll = useCallback((e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop - clientHeight < 50 && hasMore && !isLoading && onLoadMore) {
      onLoadMore();
    }
  }, [hasMore, isLoading, onLoadMore]);

  // Get display text for selected item
  const getSelectedText = () => {
    if (!selectedValue) return placeholder;
    const option = options.find(opt => opt.value === selectedValue);
    return option ? option.label : placeholder;
  };

  // Handle option selection
  const handleSelect = (value) => {
    onChange(value);
    setIsOpen(false);
  };

  return (
    <div className="mb-4" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-left flex justify-between items-center"
        >
          <span className="text-sm text-gray-700">{getSelectedText()}</span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div 
            className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
            onScroll={handleScroll}
            ref={listRef}
          >
            <div
              onClick={() => handleSelect('')}
              className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-500"
            >
              {placeholder}
            </div>
            {options.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">No options available</div>
            ) : (
              <>
                {options.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={`px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm ${
                      selectedValue === option.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    {option.label}
                  </div>
                ))}
                {isLoading && (
                  <div className="px-3 py-2 text-sm text-gray-500 text-center">
                    Loading more...
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectDropdown;
