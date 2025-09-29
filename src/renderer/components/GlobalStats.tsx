import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { Currency } from '../types/crypto';
import cryptoApi from '../services/cryptoApi';
import CurrencySelector from './CurrencySelector';

interface GlobalStatsProps {
  currency: Currency;
  onRefresh: () => void;
  isRefreshing: boolean;
  onCurrencyChange: (currency: Currency) => void;
  onTrendChange?: (trend: 'positive' | 'negative' | 'neutral') => void;
  lastRefreshTime: Date | null;
}

interface GlobalMarketData {
  totalMarketCap: number;
  totalMarketCapChange24h: number;
  marketCapAth: number | null;
  marketCapAthDate: string | null;
  activeCoins: number;
  markets: number;
}

const GlobalStats: React.FC<GlobalStatsProps> = ({ currency, onRefresh, isRefreshing, onCurrencyChange, onTrendChange, lastRefreshTime }) => {
  const [globalData, setGlobalData] = useState<GlobalMarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  // Load persisted data on component mount
  useEffect(() => {
    const persistedData = localStorage.getItem('globalMarketData');
    if (persistedData) {
      try {
        const parsed = JSON.parse(persistedData);
        setGlobalData(parsed);
        setLoading(false);
      } catch (error) {
        console.warn('Error parsing persisted global data:', error);
      }
    }
    loadGlobalData();
  }, []);

  useEffect(() => {
    if (globalData && onTrendChange) {
      const changePercent = globalData.totalMarketCapChange24h;
      const neutralThreshold = 0.5; // ±0.5% considered neutral

      let trend: 'positive' | 'negative' | 'neutral';
      if (Math.abs(changePercent) <= neutralThreshold) {
        trend = 'neutral';
      } else if (changePercent > neutralThreshold) {
        trend = 'positive';
      } else {
        trend = 'negative';
      }

      onTrendChange(trend);
    }
  }, [globalData, onTrendChange]);

  const loadGlobalData = async () => {
    try {
      setLoading(true);
      const data = await cryptoApi.getGlobalMarketData();
      if (data) {
        setGlobalData(data);
        // Persist the data to localStorage
        localStorage.setItem('globalMarketData', JSON.stringify(data));
      } else if (!globalData) {
        // If no data from API and no existing data, use fallback
        const fallbackData: GlobalMarketData = {
          totalMarketCap: 2500000000000, // $2.5T approximate
          totalMarketCapChange24h: 0,
          marketCapAth: null,
          marketCapAthDate: null,
          activeCoins: 10000,
          markets: 500
        };
        setGlobalData(fallbackData);
        console.log('Using fallback global market data');
      }
    } catch (error) {
      console.error('Error loading global market data:', error);
      // If error and no existing data, use fallback
      if (!globalData) {
        const fallbackData: GlobalMarketData = {
          totalMarketCap: 2500000000000, // $2.5T approximate
          totalMarketCapChange24h: 0,
          marketCapAth: null,
          marketCapAthDate: null,
          activeCoins: 10000,
          markets: 500
        };
        setGlobalData(fallbackData);
        console.log('Using fallback global market data due to error');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatLargeNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculatePercentFromAth = () => {
    if (!globalData?.marketCapAth || !globalData?.totalMarketCap) return null;
    const percentFromAth = ((globalData.totalMarketCap - globalData.marketCapAth) / globalData.marketCapAth) * 100;
    return percentFromAth;
  };

  if (loading && !globalData) {
    return (
      <div className="global-stats-card">
        <div className="global-stats-loading">Loading market data...</div>
      </div>
    );
  }

  // Always render something - never return null
  if (!globalData) {
    // This should never happen now, but just in case
    const fallbackData: GlobalMarketData = {
      totalMarketCap: 2500000000000,
      totalMarketCapChange24h: 0,
      marketCapAth: null,
      marketCapAthDate: null,
      activeCoins: 10000,
      markets: 500
    };
    // Set the fallback data
    setGlobalData(fallbackData);
  }

  // Ensure we always have data to render
  const safeGlobalData = globalData || {
    totalMarketCap: 2500000000000,
    totalMarketCapChange24h: 0,
    marketCapAth: null,
    marketCapAthDate: null,
    activeCoins: 10000,
    markets: 500
  };

  const percentFromAth = calculatePercentFromAth();
  const changePercent = safeGlobalData.totalMarketCapChange24h;
  const neutralThreshold = 0.5;

  const getSentiment = () => {
    if (Math.abs(changePercent) <= neutralThreshold) {
      return 'neutral';
    } else if (changePercent > neutralThreshold) {
      return 'positive';
    } else {
      return 'negative';
    }
  };

  const sentiment = getSentiment();
  const isPositiveFromAth = percentFromAth ? percentFromAth >= 0 : false;

  const formatLastRefreshTime = () => {
    if (!lastRefreshTime) return 'Never';

    const now = new Date();
    const diffMs = now.getTime() - lastRefreshTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;

    return lastRefreshTime.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleMouseEnter = () => {
    const timeout = setTimeout(() => {
      setShowTooltip(true);
    }, 1000); // 1 second delay
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setShowTooltip(false);
  };

  return (
    <div className="global-stats-card">
      <div className="market-sentiment">
        <div className="sentiment-message">
          Today the market is <span className={`sentiment-word ${sentiment}`}>
            {sentiment === 'positive' ? 'bullish' : sentiment === 'negative' ? 'bearish' : 'neutral'}
          </span>
        </div>
        <div className="market-cap-change">
          {sentiment === 'neutral'
            ? `Market cap ${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}% (sideways)`
            : `Market cap ${sentiment === 'positive' ? 'up' : 'down'} ${Math.abs(changePercent).toFixed(2)}%`
          }
        </div>
      </div>

      <div className="global-stats-controls">
        <CurrencySelector
          currency={currency}
          onChange={onCurrencyChange}
        />
        <div className="refresh-button-container">
          <button
            className={`icon-btn ${isRefreshing ? 'spinning' : ''}`}
            onClick={onRefresh}
            disabled={isRefreshing}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <RefreshCw size={16} />
          </button>
          {showTooltip && (
            <div className="refresh-tooltip">
              Last updated: {formatLastRefreshTime()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalStats;