import React from 'react';

export interface Ecosystem {
  id: string;
  name: string;
  color: string;
  category: string; // CoinGecko category ID
  iconUrl: string; // Icon URL
}

export const ECOSYSTEMS: Ecosystem[] = [
  // Stacks first (as requested)
  { id: 'stacks', name: 'Stacks', color: '#FC6432', category: 'stacks-ecosystem', iconUrl: 'https://raw.githubusercontent.com/0xa3k5/web3icons/main/packages/core/src/svgs/networks/mono/stacks.svg' },

  // Sorted by TVL (approximate order based on DeFiLlama data)
  { id: 'ethereum', name: 'Ethereum', color: '#627EEA', category: 'ethereum-ecosystem', iconUrl: 'https://raw.githubusercontent.com/0xa3k5/web3icons/main/packages/core/src/svgs/networks/branded/ethereum.svg' },
  { id: 'bnb', name: 'BNB Chain', color: '#F3BA2F', category: 'binance-smart-chain', iconUrl: 'https://raw.githubusercontent.com/0xa3k5/web3icons/main/packages/core/src/svgs/networks/branded/bnb.svg' },
  { id: 'solana', name: 'Solana', color: '#9945FF', category: 'solana-ecosystem', iconUrl: 'https://raw.githubusercontent.com/0xa3k5/web3icons/main/packages/core/src/svgs/networks/branded/solana.svg' },
  { id: 'polygon', name: 'Polygon', color: '#8247E5', category: 'polygon-ecosystem', iconUrl: 'https://raw.githubusercontent.com/0xa3k5/web3icons/main/packages/core/src/svgs/networks/branded/polygon.svg' },
  { id: 'base', name: 'Base', color: '#0052FF', category: 'base-ecosystem', iconUrl: 'https://raw.githubusercontent.com/0xa3k5/web3icons/main/packages/core/src/svgs/networks/branded/base.svg' },
  { id: 'optimism', name: 'Optimism', color: '#FF0420', category: 'optimism-ecosystem', iconUrl: 'https://raw.githubusercontent.com/0xa3k5/web3icons/main/packages/core/src/svgs/networks/branded/optimism.svg' },
  { id: 'aptos', name: 'Aptos', color: '#00D4AA', category: 'aptos-ecosystem', iconUrl: 'https://raw.githubusercontent.com/0xa3k5/web3icons/main/packages/core/src/svgs/networks/branded/aptos.svg' },
  { id: 'bitcoin', name: 'Bitcoin', color: '#F7931A', category: 'bitcoin-ecosystem', iconUrl: 'https://raw.githubusercontent.com/0xa3k5/web3icons/main/packages/core/src/svgs/networks/branded/bitcoin.svg' },
];

interface EcosystemChipsProps {
  selectedEcosystem: string | null;
  onEcosystemSelect: (ecosystem: Ecosystem) => void;
}

const EcosystemChips: React.FC<EcosystemChipsProps> = ({
  selectedEcosystem,
  onEcosystemSelect,
}) => {
  return (
    <div className="ecosystem-chips">
      {ECOSYSTEMS.map((ecosystem) => {
        return (
          <button
            key={ecosystem.id}
            className={`ecosystem-chip-icon ${selectedEcosystem === ecosystem.id ? 'selected' : ''}`}
            onClick={() => onEcosystemSelect(ecosystem)}
            title={ecosystem.name}
            style={{
              '--ecosystem-color': ecosystem.color,
            } as React.CSSProperties}
          >
            <img
              src={ecosystem.iconUrl}
              alt={ecosystem.name}
              className="chain-icon"
            />
          </button>
        );
      })}
    </div>
  );
};

export default EcosystemChips;