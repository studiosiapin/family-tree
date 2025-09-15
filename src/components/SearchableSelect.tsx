import React, { useState, useEffect, useRef } from 'react';

interface SearchableSelectProps<T> {
  items: T[];
  displayKey: keyof T;
  valueKey: keyof T;
  selectedValue: number | string | '';
  onSelect: (value: string) => void;
  placeholder?: string;
  renderOption?: (item: T) => React.ReactNode;
}

export function SearchableSelect<T>({
  items,
  displayKey,
  valueKey,
  selectedValue,
  onSelect,
  placeholder = "Search and select...",
  renderOption
}: SearchableSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter items based on search term
  const filteredItems = items.filter(item =>
    String(item[displayKey]).toLowerCase().includes(inputValue.toLowerCase())
  );

  // Update input value when selected value changes externally
  useEffect(() => {
    if (selectedValue) {
      const selectedItem = items.find(item => item[valueKey] === selectedValue);
      if (selectedItem) {
        setInputValue(String(selectedItem[displayKey]));
      }
    } else if (selectedValue === '') {
      setInputValue('');
    }
  }, [selectedValue, items, displayKey, valueKey]);

  // Reset highlighted index when filtered results change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [filteredItems]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setIsOpen(true);
  };

  const handleInputBlur = () => {
    // Delay to allow option click to register
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
        // If no item is selected and input has text, keep the text
        // If an item is selected, revert to selected item's display value
        if (selectedValue) {
          const selectedItem = items.find(item => item[valueKey] === selectedValue);
          if (selectedItem) setInputValue(String(selectedItem[displayKey]));
        }
      }
    }, 150);
  };

  const handleOptionClick = (item: T) => {
    onSelect(String(item[valueKey]));
    setInputValue(String(item[displayKey]));
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredItems.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredItems.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredItems[highlightedIndex]) {
          handleOptionClick(filteredItems[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        // Revert to selected item's display value or clear if none selected
        if (selectedValue) {
          const selectedItem = items.find(item => item[valueKey] === selectedValue);
          if (selectedItem) setInputValue(String(selectedItem[displayKey]));
        } else {
          setInputValue('');
        }
        inputRef.current?.blur();
        break;
    }
  };

  return (
    <div className="searchable-select">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="searchable-select-input"
      />
      
      {isOpen && (
        <div ref={dropdownRef} className="searchable-select-dropdown">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <div
                key={String(item[valueKey])}
                className={`searchable-select-option ${
                  index === highlightedIndex ? 'highlighted' : ''
                } ${
                  String(item[valueKey]) === selectedValue.toString() ? 'selected' : ''
                }`}
                onClick={() => handleOptionClick(item)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                {renderOption ? renderOption(item) : (
                  <span className="option-name">
                    {String(item[displayKey])}
                  </span>
                )}
              </div>
            ))
          ) : (
            <div className="searchable-select-no-results">
              {inputValue ? `No items found matching "${inputValue}"` : 'No items available'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}