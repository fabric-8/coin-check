import axios from 'axios';
import { Crypto, Currency } from '../types/crypto';

// Using CoinGecko public API (no key required for basic usage)
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';
const EXCHANGE_RATE_API = 'https://api.exchangerate-api.com/v4/latest/USD';

// Exchange rates cache
let exchangeRates: Record<string, number> = {
  USD: 1,
  EUR: 0.85,
  GBP: 0.73,
  JPY: 110,
  CAD: 1.25,
  AUD: 1.35
};

class CryptoApiService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 300000; // 5 minutes for in-memory cache
  private persistentCacheTimeout = 3600000; // 1 hour for localStorage cache

  async getTopCryptos(limit: number = 20): Promise<Crypto[]> {
    const cacheKey = `top_${limit}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // CoinGecko API: markets endpoint
      const response = await axios.get(`${COINGECKO_BASE_URL}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: limit,
          page: 1,
          sparkline: false
        }
      });

      // Transform CoinGecko data to our Crypto format
      const data = response.data.map((coin: any, index: number) => ({
        id: coin.id,
        rank: String(index + 1),
        symbol: coin.symbol,
        name: coin.name,
        priceUsd: String(coin.current_price),
        changePercent24Hr: String(coin.price_change_percentage_24h || 0),
        marketCapUsd: String(coin.market_cap),
        volumeUsd24Hr: String(coin.total_volume),
        image: coin.image
      }));

      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching top cryptos:', error);
      // Fallback to stale cached data if available
      const staleData = this.getStaleCache(cacheKey);
      if (staleData) {
        console.log('Using stale cached data for top cryptos');
        return staleData;
      }
      console.warn('No cached data available for top cryptos');
      return [];
    }
  }

  async searchCrypto(query: string): Promise<Crypto[]> {
    if (!query || query.length < 1) return [];

    try {
      // Search in top 250 coins for better coverage
      const topCryptos = await this.getTopCryptos(250);
      const searchTerm = query.toLowerCase().trim();

      // Prioritize exact symbol matches, then partial matches
      const results = topCryptos.filter(crypto => {
        const symbolMatch = crypto.symbol.toLowerCase() === searchTerm;
        const nameMatch = crypto.name.toLowerCase().includes(searchTerm);
        const symbolPartialMatch = crypto.symbol.toLowerCase().includes(searchTerm);
        return symbolMatch || nameMatch || symbolPartialMatch;
      });

      // Sort results: exact symbol matches first
      results.sort((a, b) => {
        const aExact = a.symbol.toLowerCase() === searchTerm;
        const bExact = b.symbol.toLowerCase() === searchTerm;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        return 0;
      });

      return results.slice(0, 20);
    } catch (error) {
      console.error('Error searching cryptos:', error);
      return [];
    }
  }

  async getCryptoById(id: string): Promise<Crypto | null> {
    const cacheKey = `crypto_${id}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${COINGECKO_BASE_URL}/coins/${id}`);
      const coin = response.data;

      const data: Crypto = {
        id: coin.id,
        rank: String(coin.market_cap_rank || 0),
        symbol: coin.symbol,
        name: coin.name,
        priceUsd: String(coin.market_data?.current_price?.usd || 0),
        changePercent24Hr: String(coin.market_data?.price_change_percentage_24h || 0),
        marketCapUsd: String(coin.market_data?.market_cap?.usd || 0),
        volumeUsd24Hr: String(coin.market_data?.total_volume?.usd || 0)
      };

      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Error fetching crypto ${id}:`, error);
      return null;
    }
  }

  async updateExchangeRates(): Promise<void> {
    try {
      const response = await axios.get(EXCHANGE_RATE_API);
      const rates = response.data.rates;
      exchangeRates = {
        USD: 1,
        EUR: rates.EUR || 0.85,
        GBP: rates.GBP || 0.73,
        JPY: rates.JPY || 110,
        CAD: rates.CAD || 1.25,
        AUD: rates.AUD || 1.35
      };
    } catch (error) {
      console.error('Error updating exchange rates:', error);
      // Keep using default rates
    }
  }

  convertPrice(priceUsd: string | number, currency: Currency): string {
    const usdPrice = typeof priceUsd === 'string' ? parseFloat(priceUsd) : priceUsd;
    const rate = exchangeRates[currency] || 1;
    const convertedPrice = usdPrice * rate;

    // Format based on currency
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: convertedPrice < 1 ? 6 : 2
    });

    return formatter.format(convertedPrice);
  }

  convertLargeValue(priceUsd: string | number, currency: Currency): string {
    const usdPrice = typeof priceUsd === 'string' ? parseFloat(priceUsd) : priceUsd;
    const rate = exchangeRates[currency] || 1;
    const convertedPrice = usdPrice * rate;

    // Format large values with no decimal places
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });

    return formatter.format(convertedPrice);
  }

  formatLargeNumber(priceUsd: string | number, currency: Currency): string {
    const usdPrice = typeof priceUsd === 'string' ? parseFloat(priceUsd) : priceUsd;
    const rate = exchangeRates[currency] || 1;
    const convertedPrice = usdPrice * rate;

    // Get currency symbol
    const currencySymbols: Record<Currency, string> = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'CAD': 'C$',
      'AUD': 'A$'
    };

    const symbol = currencySymbols[currency] || '$';

    // Format with K, M, B suffix
    if (convertedPrice >= 1e9) return `${symbol}${(convertedPrice / 1e9).toFixed(2)}B`;
    if (convertedPrice >= 1e6) return `${symbol}${(convertedPrice / 1e6).toFixed(2)}M`;
    if (convertedPrice >= 1e3) return `${symbol}${(convertedPrice / 1e3).toFixed(2)}K`;
    return `${symbol}${convertedPrice.toLocaleString()}`;
  }

  formatChangePercent(change: string | number): { text: string; isPositive: boolean } {
    const changeNum = typeof change === 'string' ? parseFloat(change) : change;
    const isPositive = changeNum >= 0;
    const text = `${isPositive ? '+' : ''}${changeNum.toFixed(2)}%`;
    return { text, isPositive };
  }

  private getFromCache(key: string): any {
    // First check in-memory cache
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    // Then check localStorage for persistent cache
    try {
      const persistentData = localStorage.getItem(`crypto_cache_${key}`);
      if (persistentData) {
        const parsed = JSON.parse(persistentData);
        if (Date.now() - parsed.timestamp < this.persistentCacheTimeout) {
          // Restore to in-memory cache
          this.cache.set(key, { data: parsed.data, timestamp: parsed.timestamp });
          return parsed.data;
        }
      }
    } catch (error) {
      console.warn('Error reading from localStorage cache:', error);
    }

    return null;
  }

  private setCache(key: string, data: any): void {
    const timestamp = Date.now();
    const cacheEntry = { data, timestamp };

    // Set in-memory cache
    this.cache.set(key, cacheEntry);

    // Set persistent cache in localStorage
    try {
      localStorage.setItem(`crypto_cache_${key}`, JSON.stringify(cacheEntry));
    } catch (error) {
      console.warn('Error writing to localStorage cache:', error);
    }
  }

  async getCryptoDetails(id: string): Promise<any> {
    const cacheKey = `details_${id}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Get detailed coin data including market data, description, links
      const response = await axios.get(`${COINGECKO_BASE_URL}/coins/${id}`, {
        params: {
          localization: false,
          tickers: false,
          market_data: true,
          community_data: true,
          developer_data: false,
          sparkline: true
        }
      });

      const coin = response.data;
      const marketData = coin.market_data || {};

      // Fetch historical data for 7d, 30d and 1y charts (skip 1d - will extract from 7d)
      const [chartData7d, chartData30d, chartData1y] = await Promise.all([
        this.getHistoricalPrices(id, 7),
        this.getHistoricalPrices(id, 30),
        this.getHistoricalPrices(id, 365)
      ]);

      const details = {
        id: coin.id,
        rank: String(coin.market_cap_rank || 0),
        symbol: coin.symbol,
        name: coin.name,
        image: coin.image?.large || coin.image?.small,
        priceUsd: String(marketData.current_price?.usd || 0),
        changePercent24Hr: String(marketData.price_change_percentage_24h || 0),
        marketCapUsd: String(marketData.market_cap?.usd || 0),
        volumeUsd24Hr: String(marketData.total_volume?.usd || 0),

        // Additional details
        description: coin.description?.en?.split('.')[0] + '.' || '', // First sentence
        homepage: coin.links?.homepage?.[0],
        athPrice: marketData.ath?.usd,
        athDate: marketData.ath_date?.usd,
        atlPrice: marketData.atl?.usd,
        atlDate: marketData.atl_date?.usd,
        priceChange7d: marketData.price_change_percentage_7d,
        priceChange30d: marketData.price_change_percentage_30d,
        priceChange1y: marketData.price_change_percentage_1y,
        circulatingSupply: marketData.circulating_supply,
        totalSupply: marketData.total_supply,
        maxSupply: marketData.max_supply,
        sparkline1d: this.extract1DFromSparkline(marketData.sparkline_7d?.price || chartData7d),
        sparkline: marketData.sparkline_7d?.price || chartData7d,
        sparkline30d: chartData30d,
        sparkline1y: chartData1y
      };

      this.setCache(cacheKey, details);
      return details;
    } catch (error) {
      console.error(`Error fetching crypto details for ${id}:`, error);
      // Fallback to stale cached data if available
      const staleData = this.getStaleCache(cacheKey);
      if (staleData) {
        console.log(`Using stale cached data for crypto details: ${id}`);
        return staleData;
      }
      console.warn(`No cached data available for crypto details: ${id}`);
      return null;
    }
  }

  async getHistoricalPrices(id: string, days: number): Promise<number[] | null> {
    try {
      const response = await axios.get(`${COINGECKO_BASE_URL}/coins/${id}/market_chart`, {
        params: {
          vs_currency: 'usd',
          days: days,
          interval: days > 90 ? 'daily' : 'hourly'
        }
      });

      // Extract just the prices (not timestamps)
      return response.data.prices.map((item: any[]) => item[1]);
    } catch (error) {
      console.error(`Error fetching historical prices for ${id}:`, error);
      return null;
    }
  }

  async getGlobalMarketData(): Promise<any> {
    const cacheKey = 'global_market';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${COINGECKO_BASE_URL}/global`);
      const globalData = response.data.data;

      const data = {
        totalMarketCap: globalData.total_market_cap?.usd || 0,
        totalMarketCapChange24h: globalData.market_cap_change_percentage_24h_usd || 0,
        marketCapAth: globalData.market_cap_ath || null,
        marketCapAthDate: globalData.market_cap_ath_date || null,
        activeCoins: globalData.active_cryptocurrencies || 0,
        markets: globalData.markets || 0
      };

      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching global market data:', error);
      // Fallback to stale cached data if available
      const staleData = this.getStaleCache(cacheKey);
      if (staleData) {
        console.log('Using stale cached data for global market data');
        return staleData;
      }
      console.warn('No cached data available for global market data');
      return null;
    }
  }

  async getCryptosByCategory(category: string): Promise<Crypto[]> {
    const cacheKey = `category_${category}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    console.log(`[DEBUG] Fetching cryptos for category: ${category}`);

    // First try CoinGecko category API
    try {
      const response = await axios.get(`${COINGECKO_BASE_URL}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          category: category,
          order: 'market_cap_desc',
          per_page: 100,
          page: 1,
          sparkline: false
        }
      });

      console.log(`[DEBUG] Category ${category} API response:`, response.data?.length, 'coins');

      if (response.data && response.data.length > 0) {
        // Transform CoinGecko data to our Crypto format
        const data = response.data.map((coin: any, index: number) => ({
          id: coin.id,
          rank: String(index + 1),
          symbol: coin.symbol,
          name: coin.name,
          priceUsd: String(coin.current_price),
          changePercent24Hr: String(coin.price_change_percentage_24h || 0),
          marketCapUsd: String(coin.market_cap),
          volumeUsd24Hr: String(coin.total_volume),
          image: coin.image
        }));

        this.setCache(cacheKey, data);
        return data;
      }
    } catch (error) {
      console.error(`Error with category API for ${category}:`, axios.isAxiosError(error) ? error.response?.status : error);
    }

    // Fallback: manually filter top cryptos by ecosystem-specific coins
    console.log(`[DEBUG] Using fallback manual filtering for category: ${category}`);
    return this.getCryptosByEcosystemFallback(category);
  }

  private async getCryptosByEcosystemFallback(category: string): Promise<Crypto[]> {
    // Define ecosystem-specific coin lists
    const ecosystemCoins: Record<string, string[]> = {
      'layer-1': ['bitcoin', 'ethereum', 'solana', 'cardano', 'avalanche-2', 'polkadot', 'near'],
      'ethereum-ecosystem': ['ethereum', 'chainlink', 'uniswap', 'aave', 'compound-governance-token', 'maker', 'lido-dao', 'the-graph', '1inch', 'ens'],
      'solana-ecosystem': ['solana', 'serum', 'raydium', 'orca', 'marinade', 'solend', 'step-finance', 'star-atlas', 'phantom', 'jupiter-exchange-solana'],
      'stacks-ecosystem': ['stacks', 'alex-lab', 'citycoins', 'wrapped-bitcoin', 'blockstack'],
      'polygon-ecosystem': ['matic-network', 'aavegotchi', 'quickswap', 'polyswarm', 'decentral-games', 'gains-network'],
      'base-ecosystem': ['coinbase-wrapped-staked-eth', 'aerodrome-finance', 'friend-tech'],
      'optimism-ecosystem': ['optimism', 'synthetix-network-token', 'velodrome-finance', 'thales'],
      'aptos-ecosystem': ['aptos', 'liquid-staking-aptos', 'pancakeswap-aptos'],
      'bitcoin-ecosystem': ['bitcoin', 'wrapped-bitcoin', 'bitcoin-cash', 'bitcoin-sv', 'dogecoin', 'litecoin', 'ordinals'],
      'decentralized-finance-defi': ['uniswap', 'aave', 'compound-governance-token', 'maker', 'curve-dao-token', 'sushiswap', 'yearn-finance'],
      'smart-contract-platform': ['ethereum', 'binancecoin', 'solana', 'cardano', 'avalanche-2', 'polkadot', 'near'],
      'binance-smart-chain': ['binancecoin', 'pancakeswap-token', 'trust-wallet-token', 'venus', 'bakerytoken', 'beefy-finance']
    };

    const coinIds = ecosystemCoins[category] || [];
    if (coinIds.length === 0) {
      console.log(`[DEBUG] No fallback coins defined for category: ${category}`);
      return [];
    }

    try {
      // Get specific coins by ID
      const response = await axios.get(`${COINGECKO_BASE_URL}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          ids: coinIds.join(','),
          order: 'market_cap_desc',
          per_page: 50,
          page: 1,
          sparkline: false
        }
      });

      console.log(`[DEBUG] Fallback filtering found:`, response.data?.length, 'coins for category:', category);

      const data = response.data.map((coin: any, index: number) => ({
        id: coin.id,
        rank: String(index + 1),
        symbol: coin.symbol,
        name: coin.name,
        priceUsd: String(coin.current_price),
        changePercent24Hr: String(coin.price_change_percentage_24h || 0),
        marketCapUsd: String(coin.market_cap),
        volumeUsd24Hr: String(coin.total_volume),
        image: coin.image
      }));

      this.setCache(`category_${category}`, data);
      return data;
    } catch (error) {
      console.error(`Error in fallback filtering for ${category}:`, error);
      // Fallback to stale cached data if available
      const staleData = this.getStaleCache(`category_${category}`);
      if (staleData) {
        console.log(`Using stale cached data for fallback category: ${category}`);
        return staleData;
      }
      console.warn(`No cached data available for category: ${category}`);
      return [];
    }
  }

  async searchCryptoInCategory(query: string, category: string): Promise<Crypto[]> {
    if (!query || query.length < 1) {
      // If no query, just return all cryptos in the category
      return this.getCryptosByCategory(category);
    }

    try {
      // Get all cryptos in the category first
      const categoryData = await this.getCryptosByCategory(category);
      const searchTerm = query.toLowerCase().trim();

      // Filter within the category results
      const results = categoryData.filter(crypto => {
        const symbolMatch = crypto.symbol.toLowerCase() === searchTerm;
        const nameMatch = crypto.name.toLowerCase().includes(searchTerm);
        const symbolPartialMatch = crypto.symbol.toLowerCase().includes(searchTerm);
        return symbolMatch || nameMatch || symbolPartialMatch;
      });

      // Sort results: exact symbol matches first
      results.sort((a, b) => {
        const aExact = a.symbol.toLowerCase() === searchTerm;
        const bExact = b.symbol.toLowerCase() === searchTerm;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        return 0;
      });

      return results.slice(0, 20);
    } catch (error) {
      console.error(`Error searching cryptos in category ${category}:`, error);
      return [];
    }
  }

  clearCache(): void {
    this.cache.clear();

    // Clear localStorage cache as well
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('crypto_cache_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Error clearing localStorage cache:', error);
    }
  }

  // Extract 1D chart data from 7D sparkline (last ~24 hours of data points)
  private extract1DFromSparkline(sparkline7d: number[] | null): number[] | null {
    if (!sparkline7d || sparkline7d.length === 0) {
      return null;
    }

    // CoinGecko 7D sparkline typically has 168 data points (hourly data)
    // Extract last 24-25 data points for 1D chart
    const pointsFor1D = Math.min(25, Math.floor(sparkline7d.length / 7));
    const startIndex = Math.max(0, sparkline7d.length - pointsFor1D);

    return sparkline7d.slice(startIndex);
  }

  // Get stale cached data as last resort fallback
  private getStaleCache(key: string): any {
    // Check in-memory cache regardless of age
    const cached = this.cache.get(key);
    if (cached) {
      return cached.data;
    }

    // Check localStorage regardless of age
    try {
      const persistentData = localStorage.getItem(`crypto_cache_${key}`);
      if (persistentData) {
        const parsed = JSON.parse(persistentData);
        return parsed.data;
      }
    } catch (error) {
      console.warn('Error reading stale cache:', error);
    }

    return null;
  }
}

export default new CryptoApiService();