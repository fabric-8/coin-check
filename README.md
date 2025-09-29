# Coin Check

A modern cross-platform cryptocurrency price tracker built with Electron and React.

![Coin Check](https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- 📊 **Real-time Crypto Prices** - Track top 250 cryptocurrencies by market cap
- 🔍 **Smart Search & Filtering** - Find cryptos by name or filter by blockchain ecosystem
- 💹 **Market Sentiment** - Visual indicators for bullish, bearish, or neutral market conditions
- ⭐ **Favorites** - Save and quickly access your preferred cryptocurrencies
- 🌐 **Multi-Currency Support** - View prices in USD, EUR, GBP, JPY, CAD, AUD
- 📱 **Responsive Design** - Clean, modern interface optimized for desktop
- 🚀 **Fast & Reliable** - Built-in caching and fallback systems for optimal performance

## Quick Start

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/fabric-8/coin-check.git
cd coin-check

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production

```bash
# Build the application
npm run build

# Package for distribution
npm run dist

# Platform-specific builds
npm run dist:mac    # macOS
npm run dist:win    # Windows
npm run dist:linux  # Linux
```

## Usage

1. **Browse Cryptocurrencies** - The main view shows the top cryptocurrencies with real-time prices
2. **Search** - Use the search bar to find specific coins
3. **Filter by Chain** - Click the "All Networks" button to filter by blockchain ecosystem
4. **View Details** - Click any cryptocurrency to see detailed charts and statistics
5. **Add Favorites** - Star your favorite cryptocurrencies for quick access

## Technology Stack

- **Electron** - Cross-platform desktop framework
- **React** - Modern UI library with hooks
- **TypeScript** - Type-safe JavaScript
- **Webpack** - Module bundling and hot reload
- **CoinGecko API** - Reliable cryptocurrency data source

## Project Structure

```
coin-check/
├── src/
│   ├── main/           # Electron main process
│   └── renderer/       # React frontend
│       ├── components/ # UI components
│       ├── services/   # API services
│       └── types/      # TypeScript definitions
├── public/             # Static assets
└── dist/              # Built application
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [CoinGecko](https://www.coingecko.com/) for providing free cryptocurrency data
- [Lucide](https://lucide.dev/) for beautiful icons
- [Web3 Icons](https://github.com/0xa3k5/web3icons) for blockchain network icons