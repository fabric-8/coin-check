import React from 'react';
import { Crypto, Currency } from '../types/crypto';
import CryptoItem from './CryptoItem';

interface CryptoListProps {
  cryptos: Crypto[];
  currency: Currency;
  favorites: string[];
  onToggleFavorite: (cryptoId: string) => void;
  onSelectCrypto?: (crypto: Crypto) => void;
}

const CryptoList: React.FC<CryptoListProps> = ({
  cryptos,
  currency,
  favorites,
  onToggleFavorite,
  onSelectCrypto
}) => {
  if (cryptos.length === 0) {
    return <div className="empty-state">No cryptocurrencies found</div>;
  }

  return (
    <div className="crypto-list">
      {cryptos.map(crypto => (
        <CryptoItem
          key={crypto.id}
          crypto={crypto}
          currency={currency}
          isFavorite={favorites.includes(crypto.id)}
          onToggleFavorite={() => onToggleFavorite(crypto.id)}
          onClick={() => onSelectCrypto?.(crypto)}
        />
      ))}
    </div>
  );
};

export default CryptoList;