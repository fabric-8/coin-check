import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Settings } from 'lucide-react';
import cryptoApi from './services/cryptoApi';
import { Crypto, Currency } from './types/crypto';
import SearchBar from './components/SearchBar';
import CryptoList from './components/CryptoList';
import CurrencySelector from './components/CurrencySelector';
import CryptoDetails from './components/CryptoDetails';
import GlobalStats from './components/GlobalStats';
import CustomScrollbar from './components/CustomScrollbar';
import { Ecosystem } from './components/EcosystemChips';
import './styles/app.css';

function App() {
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [filteredCryptos, setFilteredCryptos] = useState<Crypto[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currency, setCurrency] = useState<Currency>('USD');
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState<Crypto | null>(null);
  const [selectedChain, setSelectedChain] = useState<Ecosystem | null>(null);
  const [marketTrend, setMarketTrend] = useState<'positive' | 'negative' | 'neutral' | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }

    // Load currency preference
    const savedCurrency = localStorage.getItem('currency') as Currency;
    if (savedCurrency) {
      setCurrency(savedCurrency);
    }

    loadCryptos();
    cryptoApi.updateExchangeRates();
    setLastRefreshTime(new Date());

    // Set up auto-refresh every 10 minutes for better balance and reliability
    refreshInterval.current = setInterval(() => {
      handleRefresh();
    }, 600000);

    // Handle ESC key to close window
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        window.electronAPI?.hideWindow();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    // Filter cryptos based on search query and chain
    const performSearch = async () => {
      if (!searchQuery || searchQuery.length === 0) {
        // If no search query but chain is selected, filter by chain
        if (selectedChain) {
          const chainResults = await cryptoApi.getCryptosByCategory(selectedChain.category);
          setFilteredCryptos(chainResults);
        } else {
          setFilteredCryptos(cryptos);
        }
        return;
      }

      let results;
      if (selectedChain) {
        // Search within the selected chain
        results = await cryptoApi.searchCryptoInCategory(searchQuery, selectedChain.category);
      } else {
        // Regular search
        results = await cryptoApi.searchCrypto(searchQuery);
      }
      setFilteredCryptos(results);
    };

    performSearch();
  }, [searchQuery, cryptos, selectedChain]);

  const loadCryptos = async () => {
    try {
      setLoading(true);
      setError(null);
      // Load top 250 cryptos for better coverage
      const data = await cryptoApi.getTopCryptos(250);

      if (data && data.length > 0) {
        setCryptos(data);
        setFilteredCryptos(data);
        setError(null); // Clear any previous errors
      } else {
        // If we have existing crypto data, don't show error
        if (cryptos.length > 0) {
          console.warn('API returned no data, keeping existing data');
          setError(null);
        } else {
          throw new Error('No data received from API');
        }
      }
    } catch (error: any) {
      console.error('Error loading cryptos:', error);
      // Only show error if we don't have any existing data
      if (cryptos.length === 0) {
        const errorMessage = error?.response?.status === 429
          ? 'API rate limit exceeded. Please wait a moment before refreshing.'
          : error?.message || 'Failed to load cryptocurrency data. Please try again.';
        setError(errorMessage);
      } else {
        console.log('API error but keeping existing data');
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;

    try {
      setIsRefreshing(true);

      // Ensure minimum spin duration for smooth animation
      const minSpinDuration = 800; // 800ms minimum
      const startTime = Date.now();

      // Clear API cache for fresh data
      cryptoApi.clearCache();

      // Refresh both crypto data and exchange rates
      await Promise.all([
        loadCryptos(),
        cryptoApi.updateExchangeRates()
      ]);

      // Calculate remaining time to meet minimum spin duration
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, minSpinDuration - elapsed);

      // Wait for remaining time to ensure graceful animation completion
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }

      // Update last refresh time
      setLastRefreshTime(new Date());
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query || query.length === 0) {
      // If no search query but chain is selected, filter by chain
      if (selectedChain) {
        const chainResults = await cryptoApi.getCryptosByCategory(selectedChain.category);
        setFilteredCryptos(chainResults);
      } else {
        setFilteredCryptos(cryptos);
      }
      return;
    }

    let results;
    if (selectedChain) {
      // Search within the selected chain
      results = await cryptoApi.searchCryptoInCategory(query, selectedChain.category);
    } else {
      // Regular search
      results = await cryptoApi.searchCrypto(query);
    }
    setFilteredCryptos(results);
  };

  const toggleFavorite = (cryptoId: string) => {
    const newFavorites = favorites.includes(cryptoId)
      ? favorites.filter(id => id !== cryptoId)
      : [...favorites, cryptoId];

    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    localStorage.setItem('currency', newCurrency);
    window.electronAPI?.setCurrency(newCurrency);
  };

  const handleSelectCrypto = (crypto: Crypto) => {
    setSelectedCrypto(crypto);
  };

  const handleChainSelect = (chain: Ecosystem | null) => {
    console.log('[DEBUG] Chain selected:', chain?.name, chain?.category);
    setSelectedChain(chain);
  };

  const favoriteCryptos = filteredCryptos.filter(crypto =>
    favorites.includes(crypto.id)
  );
  const regularCryptos = filteredCryptos.filter(crypto =>
    !favorites.includes(crypto.id)
  );

  return (
    <div className="app">
      {selectedCrypto ? (
        <CryptoDetails
          crypto={selectedCrypto}
          currency={currency}
          onClose={() => setSelectedCrypto(null)}
        />
      ) : (
        <>
          <div className={`unified-header ${marketTrend ? `${marketTrend}-gradient` : ''}`}>
            <GlobalStats
              currency={currency}
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
              onCurrencyChange={handleCurrencyChange}
              onTrendChange={setMarketTrend}
              lastRefreshTime={lastRefreshTime}
            />
            <div className="search-container">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={() => handleSearch(searchQuery)}
                selectedChain={selectedChain}
                onChainSelect={handleChainSelect}
              />
            </div>
          </div>

          <div className="content" ref={contentRef}>
            {loading ? (
              <div className="loading">Loading cryptocurrencies...</div>
            ) : error ? (
              <div className="error-message">
                <div className="error-text">{error}</div>
                <button
                  className="retry-button"
                  onClick={loadCryptos}
                >
                  Try Again
                </button>
              </div>
            ) : (
              <>
                {favoriteCryptos.length > 0 && (
                  <>
                    <CryptoList
                      cryptos={favoriteCryptos}
                      currency={currency}
                      favorites={favorites}
                      onToggleFavorite={toggleFavorite}
                      onSelectCrypto={handleSelectCrypto}
                    />
                    <div className="section-divider" />
                  </>
                )}
                <CryptoList
                  cryptos={regularCryptos}
                  currency={currency}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                  onSelectCrypto={handleSelectCrypto}
                />
              </>
            )}
          </div>
          <CustomScrollbar contentRef={contentRef} />
        </>
      )}
    </div>
  );
}

export default App;