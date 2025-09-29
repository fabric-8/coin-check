import React from 'react';
import { Search, X } from 'lucide-react';
import { Ecosystem } from './EcosystemChips';
import ChainDropdown from './ChainDropdown';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  selectedChain: Ecosystem | null;
  onChainSelect: (chain: Ecosystem | null) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSearch,
  selectedChain,
  onChainSelect
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  const handleClear = () => {
    onChange('');
  };

  const getPlaceholder = () => {
    if (selectedChain) {
      return `Search in ${selectedChain.name} ecosystem...`;
    }
    return "Search tokens";
  };

  return (
    <div className="search-bar">
      <Search className="search-icon" />
      <input
        type="text"
        placeholder={getPlaceholder()}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        className="search-input"
      />
      {value && (
        <button className="search-clear-btn" onClick={handleClear}>
          <X size={16} />
        </button>
      )}
      <ChainDropdown
        selectedChain={selectedChain}
        onChainSelect={onChainSelect}
      />
    </div>
  );
};

export default SearchBar;