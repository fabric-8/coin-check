export interface Crypto {
  id: string;
  rank: string;
  symbol: string;
  name: string;
  priceUsd: string;
  changePercent24Hr: string;
  marketCapUsd: string;
  volumeUsd24Hr: string;
  image?: string;
}

export interface CryptoDetailed extends Crypto {
  supply: string;
  maxSupply: string;
  vwap24Hr: string;
}

export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD';

export interface UserPreferences {
  currency: Currency;
  favorites: string[];
  refreshInterval: number;
}