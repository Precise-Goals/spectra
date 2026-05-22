/**
 * Deployed Contract Addresses on Base Sepolia
 */
export const CONTRACT_ADDRESSES = {
  MOCK_USD: '0x0d88090A68A9D4172ef9Ed6068723D61D05a8057',
  SPECTRA_SAAS: '0x9DECC76e5f51CA5fA25d2A4f6d921Aa5aB88f529',
  SPECTRA_NFT: '0x727010d091Be1aC1a9d6f7fF06127d607581d4d6',
  SPECTRA_EXCHANGE: '0x99faFABBE6aCCF914Ef315e5bfC690F5814E9097',
};

export const NETWORK_INFO = {
  name: 'Base Sepolia',
  chainId: 84532,
  rpcUrl: 'https://sepolia.base.org',
  explorerUrl: 'https://sepolia.basescan.org',
};

export const TOKEN_ADDRESSES = {
  MUSD: '0x0d88090A68A9D4172ef9Ed6068723D61D05a8057',
  USDC: '0xd9aAEc86B65D86f6A7B5a147f4f0E4A6fEAeA58d',
  WETH: '0x4200000000000000000000000000000000000006',
  WBTC: '0x0000000000000000000000000000000000000000',
};

export const CONTRACT_ABIS = {
  MOCK_USD: [
    'function balanceOf(address owner) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function approve(address spender, uint256 amount) returns (bool)',
  ],
  SPECTRA_EXCHANGE: [
    'function swap(address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut) external',
    'function getQuote(address tokenIn, address tokenOut, uint256 amountIn) view returns (uint256 amountOut)',
  ],
  SPECTRA_NFT: [
    'function mintSubscribedNFT(string tokenURI) external',
    'function mintGenesisBadge() external',
    'function mintVectorBadge() external',
    'function mintNexusBadge() external',
  ],
  SPECTRA_SAAS: [
    'function subscribe(uint8 _tier) external',
    'function getUserTier(address _user) view returns (uint8)',
  ],
};
