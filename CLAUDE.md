# Coin Check - Cryptocurrency Price Tracker

A cross-platform Electron application for tracking cryptocurrency prices with real-time data, chain filtering, and detailed analytics.

## Project Structure

```
coin-check/
├── src/
│   ├── main/           # Electron main process
│   └── renderer/       # React frontend
│       ├── components/ # React components
│       ├── services/   # API services
│       ├── styles/     # CSS styles
│       └── types/      # TypeScript interfaces
├── public/             # Static assets
└── dist/              # Built application
```

## Key Technologies

- **Electron** - Cross-platform desktop app framework
- **React** - Frontend UI framework
- **TypeScript** - Type-safe JavaScript
- **Webpack** - Module bundler
- **CoinGecko API** - Cryptocurrency data source
- **Lucide React** - Icon library (v0.544.0)
- **Web3 Icons** - Blockchain network icons (SVG URLs)

## Development Commands

```bash
# Install dependencies
npm install

# Development mode (hot reload)
npm run dev

# Build application
npm run build

# Build and package for distribution
npm run dist

# Platform-specific builds
npm run dist:mac
npm run dist:win
npm run dist:linux
```

## Core Features

### 1. Cryptocurrency List
- Top 250 cryptocurrencies by market cap
- Real-time price updates
- 24h price change indicators
- Favorite/unfavorite functionality
- Search and filtering capabilities

### 2. Chain/Ecosystem Filtering
- Dropdown selector with chain icons
- Supported ecosystems:
  - Stacks (#FC6432)
  - Ethereum (#627EEA)
  - BNB Chain (#F3BA2F)
  - Solana (#9945FF)
  - Polygon (#8247E5)
  - Base (#0052FF)
  - Optimism (#FF0420)
  - Aptos (#00D4AA)
  - Bitcoin (#F7931A)

### 3. Detailed Crypto View
- Price charts with 1D/7D/1Y timeframes
- Comprehensive statistics (ATH, ATL, supply data)
- Price converter with multiple currencies
- External links to homepage/explorer

### 4. Global Market Stats
- Total market cap and 24h change
- Market trend indicators
- Atmospheric gradient backgrounds (bullish/bearish)

## API Service Architecture

### Cache System
- **In-memory cache**: 5 minutes
- **localStorage persistence**: 1 hour
- **Stale cache fallback**: Unlimited age for resilience

### Error Handling
- Multi-layer fallback system
- Graceful degradation
- No broken views on API failures
- Smart error messaging

### Rate Limiting
- 10-minute auto-refresh intervals
- Manual refresh available
- Cache-first approach

## Component Architecture

### Main Components
- `App.tsx` - Root application component
- `CryptoList.tsx` - Cryptocurrency listing
- `CryptoDetails.tsx` - Detailed crypto view modal
- `SearchBar.tsx` - Search with chain filtering
- `ChainDropdown.tsx` - Chain/ecosystem selector
- `GlobalStats.tsx` - Market overview stats

### Service Layer
- `cryptoApi.ts` - CoinGecko API integration
- Comprehensive caching and error handling
- Multi-ecosystem support with fallback data

## Styling System

### CSS Architecture
- Custom CSS variables for theming
- Responsive design patterns
- Gradient animations for market trends
- Minimal, clean UI design

### Design Patterns
- Edge-to-edge dividers in modal views
- Rounded icon containers with brand colors
- Subtle grain texture effects
- Smooth transitions and animations

## Data Flow

1. **Initial Load**: Fetch top cryptos + global stats
2. **Chain Selection**: Filter by ecosystem using API categories
3. **Search**: Real-time filtering within selected scope
4. **Details View**: Fetch comprehensive data + charts
5. **Auto-refresh**: Background updates every 10 minutes

## Configuration

### Environment Variables
- No API keys required (using CoinGecko free tier)
- Exchange rate API for currency conversion

### User Preferences (localStorage)
- Favorite cryptocurrencies
- Selected currency (USD/EUR/GBP/JPY/CAD/AUD)
- Cache persistence

## Build & Distribution

### Webpack Configuration
- Development server with hot reload
- Production optimization
- Asset bundling and minification

### Electron Builder
- Cross-platform packaging
- Auto-updater integration
- Native menu bar/system tray integration

## Known Issues & Solutions

### API Reliability
- Implemented robust caching to handle API downtime
- Stale data fallback prevents broken views
- Rate limiting to avoid API abuse

### Performance
- Optimized re-renders with React.memo
- Efficient search algorithms
- Image caching for crypto logos

## Development Notes

### Common Tasks
- **Add new ecosystem**: Update `ECOSYSTEMS` array in `EcosystemChips.tsx`
- **Modify cache timeout**: Adjust values in `CryptoApiService`
- **Update refresh interval**: Change timeout in `App.tsx`
- **Add new currency**: Update exchange rate service

### Testing
- No automated tests currently implemented
- Manual testing via development server
- Cross-platform compatibility testing

## Future Enhancements

### Planned Features
- Portfolio tracking
- Price alerts
- Historical data export
- More detailed charts
- News integration

### Technical Improvements
- Unit/integration testing
- CI/CD pipeline
- Performance monitoring
- Error reporting service

## Troubleshooting

### Common Issues
1. **API rate limiting**: Wait or force refresh after timeout
2. **Cache corruption**: Clear localStorage or use clearCache()
3. **Build failures**: Ensure all dependencies are installed
4. **Platform-specific issues**: Check Electron Builder configuration

### Debug Commands
```bash
# Clear application cache
localStorage.clear()

# Force API refresh
cryptoApi.clearCache()

# Check cache status
console.log(cryptoApi.cache)
```

## Contributing

When working on this project:
1. Follow existing code patterns and naming conventions
2. Update this CLAUDE.md file with significant changes
3. Test across platforms before committingrm 
4. Maintain backwards compatibility with user preferences

## Icon Libraries

### Lucide React (Primary Icons)
- **Version**: 0.544.0
- **Usage**: UI icons throughout the application
- **Common icons**: RefreshCw, Search, TrendingUp, TrendingDown, ChevronDown, X, Calculator, ArrowUpRight, ArrowDownRight, Grid2X2
- **Documentation**: https://lucide.dev/

### Web3 Icons (Blockchain Icons)
- **Source**: GitHub repository SVG URLs
- **Usage**: Blockchain network icons in chain dropdown
- **Base URL**: `https://raw.githubusercontent.com/0xa3k5/web3icons/main/packages/core/src/svgs/networks/`
- **Types**:
  - `branded/` - Colored brand icons
  - `mono/` - Monochrome icons (used for Stacks with custom background)

### Icon Integration Examples
```typescript
// Lucide React icons
import { Search, X, ChevronDown } from 'lucide-react';

// Web3 Icons (SVG URLs)
const iconUrl = 'https://raw.githubusercontent.com/0xa3k5/web3icons/main/packages/core/src/svgs/networks/branded/ethereum.svg';
```

## Contact & Links

- CoinGecko API: https://www.coingecko.com/api/documentation
- Electron Documentation: https://electronjs.org/docs
- Lucide Icons: https://lucide.dev/
- Web3 Icons: https://github.com/0xa3k5/web3icons