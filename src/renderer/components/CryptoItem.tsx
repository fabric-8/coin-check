import React from 'react';
import { Star } from 'lucide-react';
import { Crypto, Currency } from '../types/crypto';
import cryptoApi from '../services/cryptoApi';

interface CryptoItemProps {
  crypto: Crypto;
  currency: Currency;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClick?: () => void;
}

const CryptoItem: React.FC<CryptoItemProps> = ({
  crypto,
  currency,
  isFavorite,
  onToggleFavorite,
  onClick
}) => {
  const price = cryptoApi.convertPrice(crypto.priceUsd, currency);
  const { text: changeText, isPositive } = cryptoApi.formatChangePercent(crypto.changePercent24Hr);

  return (
    <div className="crypto-item" onClick={onClick}>
      <button
        className={`favorite-btn ${isFavorite ? 'active' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
      >
        <Star size={16} fill={isFavorite ? 'currentColor' : 'none'} />
      </button>

      <div className="crypto-icon">
        {crypto.image ? (
          <img
            src={crypto.image}
            alt={crypto.name}
            className="crypto-logo"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <span className={crypto.image ? 'hidden' : ''} style={{ fontSize: '12px', fontWeight: 600 }}>
          {crypto.symbol.substring(0, 3).toUpperCase()}
        </span>
      </div>

      <div className="crypto-info">
        <span className="crypto-name">{crypto.name}</span>
        <span className="crypto-symbol">{crypto.symbol.toUpperCase()}</span>
      </div>

      <div className="crypto-price-info">
        <span className="crypto-price">{price}</span>
        <span className={`crypto-change ${isPositive ? 'positive' : 'negative'}`}>
          {changeText}
        </span>
      </div>
    </div>
  );
};

export default CryptoItem;