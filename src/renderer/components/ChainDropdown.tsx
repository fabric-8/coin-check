import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Grid2X2 } from 'lucide-react';
import { ECOSYSTEMS, Ecosystem } from './EcosystemChips';

interface ChainDropdownProps {
  selectedChain: Ecosystem | null;
  onChainSelect: (chain: Ecosystem | null) => void;
}

const ChainDropdown: React.FC<ChainDropdownProps> = ({ selectedChain, onChainSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionSelect = (chain: Ecosystem | null) => {
    onChainSelect(chain);
    setIsOpen(false);
  };

  const renderChainIcon = (chain: Ecosystem | null) => {
    if (!chain) {
      // 2x2 grid of representative network icons for "All networks"
      const topNetworks = ECOSYSTEMS.slice(1, 5); // Skip Stacks, get Ethereum, BNB, Solana, Polygon
      return (
        <div className="chain-dropdown-icon all-networks-icon">
          <div className="networks-grid">
            {topNetworks.map((network, index) => (
              <div key={network.id} className="network-mini-icon">
                <img src={network.iconUrl} alt={network.name} />
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div
        className="chain-dropdown-icon"
        style={{ backgroundColor: chain.color }}
      >
        <img src={chain.iconUrl} alt={chain.name} />
      </div>
    );
  };

  return (
    <div className="chain-dropdown" ref={dropdownRef}>
      <button
        className="chain-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        {renderChainIcon(selectedChain)}
        <ChevronDown size={16} className="chain-dropdown-chevron" />
      </button>

      {isOpen && (
        <div className="chain-dropdown-menu">
          {/* All networks option */}
          <button
            className={`chain-dropdown-option ${!selectedChain ? 'selected' : ''}`}
            onClick={() => handleOptionSelect(null)}
          >
            {renderChainIcon(null)}
            <span>All networks</span>
            {!selectedChain && <div className="check-icon">✓</div>}
          </button>

          {/* Individual chain options */}
          {ECOSYSTEMS.map((chain) => (
            <button
              key={chain.id}
              className={`chain-dropdown-option ${selectedChain?.id === chain.id ? 'selected' : ''}`}
              onClick={() => handleOptionSelect(chain)}
            >
              {renderChainIcon(chain)}
              <span>{chain.name}</span>
              {selectedChain?.id === chain.id && <div className="check-icon">✓</div>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChainDropdown;