import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Currency } from '../types/crypto';

interface CurrencySelectorProps {
  currency: Currency;
  onChange: (currency: Currency) => void;
}

const currencies: Currency[] = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];

const CurrencySelector: React.FC<CurrencySelectorProps> = ({ currency, onChange }) => {
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

  return (
    <div className="currency-selector" ref={dropdownRef}>
      <button
        className="currency-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{currency}</span>
        <ChevronDown size={14} />
      </button>

      {isOpen && (
        <div className="currency-dropdown">
          {currencies.map(curr => (
            <button
              key={curr}
              className={`currency-option ${curr === currency ? 'active' : ''}`}
              onClick={() => {
                onChange(curr);
                setIsOpen(false);
              }}
            >
              {curr}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;