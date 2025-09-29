import React, { useEffect, useState } from 'react';
import { X, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Calculator } from 'lucide-react';
import { Crypto, Currency } from '../types/crypto';
import cryptoApi from '../services/cryptoApi';

interface CryptoDetailsProps {
  crypto: Crypto;
  currency: Currency;
  onClose: () => void;
}

interface DetailedCryptoData extends Crypto {
  description?: string;
  homepage?: string;
  athPrice?: number;
  athDate?: string;
  atlPrice?: number;
  atlDate?: string;
  priceChange7d?: number;
  priceChange30d?: number;
  priceChange1y?: number;
  circulatingSupply?: number;
  totalSupply?: number;
  maxSupply?: number;
  sparkline1d?: number[];
  sparkline?: number[];
  sparkline30d?: number[];
  sparkline1y?: number[];
}

const CryptoDetails: React.FC<CryptoDetailsProps> = ({ crypto, currency, onClose }) => {
  const [details, setDetails] = useState<DetailedCryptoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cryptoAmount, setCryptoAmount] = useState<string>('1');
  const [fiatAmount, setFiatAmount] = useState<string>('');
  const [conversionCurrency, setConversionCurrency] = useState<Currency>(currency);
  const [selectedPeriod, setSelectedPeriod] = useState<'1d' | '7d' | '1y'>('1d');

  useEffect(() => {
    loadDetails();
  }, [crypto.id]);

  useEffect(() => {
    // Update fiat amount when crypto amount or currency changes
    if (cryptoAmount && !isNaN(parseFloat(cryptoAmount))) {
      const amount = parseFloat(cryptoAmount);
      const price = parseFloat(crypto.priceUsd);
      const fiatValue = amount * price;

      // Get exchange rate for selected currency
      const exchangeRates: Record<Currency, number> = {
        'USD': 1,
        'EUR': 0.85,
        'GBP': 0.73,
        'JPY': 110,
        'CAD': 1.25,
        'AUD': 1.35
      };

      const convertedValue = fiatValue * (exchangeRates[conversionCurrency] || 1);
      setFiatAmount(convertedValue.toFixed(2));
    } else {
      setFiatAmount('');
    }
  }, [cryptoAmount, conversionCurrency, crypto.priceUsd]);

  const loadDetails = async () => {
    try {
      setLoading(true);
      const data = await cryptoApi.getCryptoDetails(crypto.id);
      setDetails(data);
    } catch (error) {
      console.error('Error loading crypto details:', error);
      setDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number | undefined) => {
    if (!num) return 'N/A';
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toLocaleString();
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatPercent = (value: number | undefined) => {
    if (value === undefined) return { text: 'N/A', isPositive: true };
    const isPositive = value >= 0;
    return {
      text: `${isPositive ? '+' : ''}${value.toFixed(2)}%`,
      isPositive
    };
  };

  const renderSparklineChart = () => {
    if (!details) return null;

    // Select the appropriate sparkline data based on selected period
    const getSparklineData = () => {
      switch (selectedPeriod) {
        case '1d': return details.sparkline1d; // 24h data
        case '7d': return details.sparkline; // 7d data
        case '1y': return details.sparkline1y; // 1y data
        default: return details.sparkline1d;
      }
    };

    const sparkline = getSparklineData();
    console.log('Chart debug - selectedPeriod:', selectedPeriod, 'sparkline:', sparkline);

    // Get the percentage change for the selected period
    const getPeriodChange = () => {
      switch (selectedPeriod) {
        case '1d': return details?.changePercent24Hr ? parseFloat(details.changePercent24Hr) : undefined;
        case '7d': return details?.priceChange7d;
        case '1y': return details?.priceChange1y;
        default: return details?.changePercent24Hr ? parseFloat(details.changePercent24Hr) : undefined;
      }
    };

    const periodChange = getPeriodChange();
    const changePercent = formatPercent(periodChange);

    // Always render the chart container with period selector
    if (!sparkline || sparkline.length === 0) {
      console.log('Chart showing no data message for period:', selectedPeriod);
      return (
        <div className="price-chart">
          <div className="chart-header">
            <div className="chart-period-selector">
              <button
                className={`period-btn ${selectedPeriod === '1d' ? 'active' : ''}`}
                onClick={() => setSelectedPeriod('1d')}
              >
                1D
              </button>
              <button
                className={`period-btn ${selectedPeriod === '7d' ? 'active' : ''}`}
                onClick={() => setSelectedPeriod('7d')}
              >
                7D
              </button>
              <button
                className={`period-btn ${selectedPeriod === '1y' ? 'active' : ''}`}
                onClick={() => setSelectedPeriod('1y')}
              >
                1Y
              </button>
            </div>
            <span className={`chart-period-change ${changePercent.isPositive ? 'positive' : 'negative'}`}>
              {changePercent.text}
            </span>
          </div>
          <div className="chart-container">
            <div className="chart-no-data">
              <span>Chart data not available for {selectedPeriod.toUpperCase()}</span>
            </div>
          </div>
        </div>
      );
    }

    // Find min and max values for scaling
    const minValue = Math.min(...sparkline);
    const maxValue = Math.max(...sparkline);
    const range = maxValue - minValue;
    console.log('Chart debug - minValue:', minValue, 'maxValue:', maxValue, 'range:', range);

    if (range === 0) {
      console.log('Chart hidden - range is 0 (all values are the same)');
      return null;
    }

    // Chart dimensions - using viewBox for responsive SVG
    const viewBoxWidth = 400;
    const viewBoxHeight = 80;
    const padding = 4;

    // Generate SVG path
    const pathData = sparkline
      .map((value, index) => {
        const x = (index / (sparkline.length - 1)) * (viewBoxWidth - padding * 2) + padding;
        const y = viewBoxHeight - padding - ((value - minValue) / range) * (viewBoxHeight - padding * 2);
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');

    // Determine if trend is positive
    const isPositive = sparkline[sparkline.length - 1] >= sparkline[0];

    return (
      <div className="price-chart">
        <div className="chart-header">
          <div className="chart-period-selector">
            <button
              className={`period-btn ${selectedPeriod === '1d' ? 'active' : ''}`}
              onClick={() => setSelectedPeriod('1d')}
            >
              1D
            </button>
            <button
              className={`period-btn ${selectedPeriod === '7d' ? 'active' : ''}`}
              onClick={() => setSelectedPeriod('7d')}
            >
              7D
            </button>
            <button
              className={`period-btn ${selectedPeriod === '1y' ? 'active' : ''}`}
              onClick={() => setSelectedPeriod('1y')}
            >
              1Y
            </button>
          </div>
          <span className={`chart-period-change ${changePercent.isPositive ? 'positive' : 'negative'}`}>
            {changePercent.text}
          </span>
        </div>
        <div className="chart-container">
          <svg
            viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
            preserveAspectRatio="none"
            className="sparkline-chart"
          >
            <defs>
              <linearGradient id={`gradient-${crypto.id}-${selectedPeriod}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={isPositive ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'} />
                <stop offset="100%" stopColor={isPositive ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)'} />
              </linearGradient>
            </defs>
            <path
              d={`${pathData} L ${viewBoxWidth - padding} ${viewBoxHeight - padding} L ${padding} ${viewBoxHeight - padding} Z`}
              fill={`url(#gradient-${crypto.id}-${selectedPeriod})`}
              stroke="none"
            />
            <path
              d={pathData}
              fill="none"
              stroke={isPositive ? '#22c55e' : '#ef4444'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    );
  };

  // Prevent closing when clicking inside modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="details-backdrop" onClick={handleBackdropClick}>
      <div className="details-modal">
        <div className="details-header">
          <div className="details-title-section">
            <img src={crypto.image} alt={crypto.name} className="details-logo" />
            <div>
              <h2 className="details-name">{crypto.name}</h2>
              <span className="details-symbol">{crypto.symbol.toUpperCase()}</span>
            </div>
          </div>
          <button onClick={onClose} className="details-close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="details-content">
          {loading ? (
            <div className="details-loading">Loading details...</div>
          ) : details ? (
            <>
              {/* Price Section */}
              <div className="details-price-section">
                <div className="details-current-price">
                  <span className="details-price-value">
                    {cryptoApi.convertPrice(crypto.priceUsd, currency)}
                  </span>
                </div>
              </div>

              {/* Chart Section */}
              {details && renderSparklineChart()}

              {/* Converter Section */}
              <div className="converter-section">
                <div className="converter-header">
                  <Calculator size={16} />
                  <span>Quick Convert</span>
                </div>
                <div className="converter-inputs">
                  <div className="converter-input">
                    <input
                      type="number"
                      value={cryptoAmount}
                      onChange={(e) => setCryptoAmount(e.target.value)}
                      placeholder="0"
                      className="converter-amount-input"
                    />
                    <span className="converter-currency">{crypto.symbol.toUpperCase()}</span>
                  </div>
                  <div className="converter-input">
                    <input
                      type="text"
                      value={fiatAmount}
                      readOnly
                      placeholder="0"
                      className="converter-amount-input readonly"
                    />
                    <select
                      className="converter-currency-select"
                      value={conversionCurrency}
                      onChange={(e) => setConversionCurrency(e.target.value as Currency)}
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="JPY">JPY</option>
                      <option value="CAD">CAD</option>
                      <option value="AUD">AUD</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="details-stats-grid">
                <div className="stat-card">
                  <span className="stat-label">Market Cap</span>
                  <span className="stat-value">{cryptoApi.formatLargeNumber(crypto.marketCapUsd, currency)}</span>
                </div>

                <div className="stat-card">
                  <span className="stat-label">24h Volume</span>
                  <span className="stat-value">{cryptoApi.formatLargeNumber(crypto.volumeUsd24Hr, currency)}</span>
                </div>

                {details.athPrice && (
                  <div className="stat-card">
                    <span className="stat-label">All-Time High</span>
                    <span className="stat-value">
                      {cryptoApi.convertPrice(details.athPrice, currency)}
                    </span>
                    <span className="stat-date">{formatDate(details.athDate)}</span>
                  </div>
                )}

                {details.atlPrice && (
                  <div className="stat-card">
                    <span className="stat-label">All-Time Low</span>
                    <span className="stat-value">
                      {cryptoApi.convertPrice(details.atlPrice, currency)}
                    </span>
                    <span className="stat-date">{formatDate(details.atlDate)}</span>
                  </div>
                )}

                {details.circulatingSupply && (
                  <div className="stat-card">
                    <span className="stat-label">Circulating Supply</span>
                    <span className="stat-value">{formatNumber(details.circulatingSupply)} {crypto.symbol.toUpperCase()}</span>
                  </div>
                )}

                {details.maxSupply && (
                  <div className="stat-card">
                    <span className="stat-label">Max Supply</span>
                    <span className="stat-value">{formatNumber(details.maxSupply)} {crypto.symbol.toUpperCase()}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              {details.description && (
                <div className="details-description">
                  <h3 className="description-title">About {crypto.name}</h3>
                  <p className="description-text">{details.description}</p>
                </div>
              )}

              {/* External Links */}
              {details.homepage && (
                <div className="details-links">
                  <a href={details.homepage} target="_blank" rel="noopener noreferrer" className="external-link">
                    <ArrowUpRight size={14} />
                    <span>Official Website</span>
                  </a>
                </div>
              )}
            </>
          ) : (
            <div className="details-error">Failed to load details</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CryptoDetails;