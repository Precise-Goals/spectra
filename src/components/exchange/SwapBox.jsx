import React, { useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ABIS, CONTRACT_ADDRESSES, TOKEN_ADDRESSES } from '../../config/contracts.js';

export const ASSET_OPTIONS = [
  { id: 'TYI', label: 'Mock USD (TYI)', tokenAddress: TOKEN_ADDRESSES.MUSD, symbol: 'USDTUSD' },
  { id: 'ETH', label: 'Ethereum (ETH)', tokenAddress: TOKEN_ADDRESSES.WETH, symbol: 'ETHUSDT' },
  { id: 'SEPOLIA_ETH', label: 'Sepolia ETH', tokenAddress: TOKEN_ADDRESSES.WETH, symbol: 'ETHUSDT' },
  { id: 'BASE_SEPOLIA_ETH', label: 'Base Sepolia ETH', tokenAddress: TOKEN_ADDRESSES.WETH, symbol: 'ETHUSDT' },
];

const ZERO = '0.00';

export default function SwapBox({
  payAmount,
  onPayAmountChange,
  receiveAmount,
  selectedAsset,
  onAssetChange,
  onTxHashChange,
  onError,
}) {
  const [account, setAccount] = useState('');
  const [ethBalance, setEthBalance] = useState(ZERO);
  const [mockUsdBalance, setMockUsdBalance] = useState(ZERO);
  const [isExecuting, setIsExecuting] = useState(false);
  const [approvalState, setApprovalState] = useState('');

  const activeAsset = selectedAsset || ASSET_OPTIONS[0].id;
  const activeAssetMeta = useMemo(() => ASSET_OPTIONS.find((option) => option.id === activeAsset) || ASSET_OPTIONS[0], [activeAsset]);

  const fetchBalances = async (provider, address) => {
    const [ethRaw, mockUsdContract] = await Promise.all([
      provider.getBalance(address),
      Promise.resolve(new ethers.Contract(TOKEN_ADDRESSES.MUSD, CONTRACT_ABIS.MOCK_USD, provider)),
    ]);

    const decimals = await mockUsdContract.decimals();
    const mockUsdRaw = await mockUsdContract.balanceOf(address);

    setEthBalance(Number(ethers.formatEther(ethRaw)).toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 }));
    setMockUsdBalance(Number(ethers.formatUnits(mockUsdRaw, decimals)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      throw new Error('No injected wallet found.');
    }

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (!accounts?.length) {
      throw new Error('Wallet returned no accounts.');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    setAccount(accounts[0]);
    await fetchBalances(provider, accounts[0]);
    return { provider, account: accounts[0] };
  };

  useEffect(() => {
    const hydrate = async () => {
      if (!window.ethereum) {
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_accounts', []);
      if (!accounts?.length) {
        return;
      }

      setAccount(accounts[0]);
      await fetchBalances(provider, accounts[0]);
    };

    hydrate().catch((error) => {
      onError?.(error?.message || 'Failed to load wallet balances.');
    });

    if (!window.ethereum) {
      return undefined;
    }

    const handleAccountsChanged = (accounts) => {
      if (!accounts?.length) {
        setAccount('');
        setEthBalance(ZERO);
        setMockUsdBalance(ZERO);
        return;
      }

      hydrate().catch((error) => onError?.(error?.message || 'Failed to refresh wallet balances.'));
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    return () => window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
  }, [onError]);

  const ensureAllowance = async (signer, spender, amountWei) => {
    const token = new ethers.Contract(TOKEN_ADDRESSES.MUSD, CONTRACT_ABIS.MOCK_USD, signer);
    const owner = await signer.getAddress();
    const currentAllowance = await token.allowance(owner, spender);

    if (currentAllowance >= amountWei) {
      return;
    }

    setApprovalState('Approving Mock USD spending...');
    const approveTx = await token.approve(spender, amountWei);
    await approveTx.wait();
    setApprovalState('Approval confirmed.');
  };

  const handleExecuteSwap = async () => {
    if (isExecuting) {
      return;
    }

    setIsExecuting(true);
    setApprovalState('');
    onError?.('');
    onTxHashChange?.('');

    try {
      if (!window.ethereum) {
        throw new Error('No injected wallet found.');
      }

      const safeAmount = Number(payAmount);
      if (!Number.isFinite(safeAmount) || safeAmount <= 0) {
        throw new Error('Enter a valid pay amount before executing swap.');
      }

      const { provider, account: user } = await connectWallet();
      const signer = await provider.getSigner();
      const amountIn = ethers.parseUnits(String(safeAmount), 18);

      await ensureAllowance(signer, CONTRACT_ADDRESSES.SPECTRA_EXCHANGE, amountIn);

      const exchange = new ethers.Contract(CONTRACT_ADDRESSES.SPECTRA_EXCHANGE, CONTRACT_ABIS.SPECTRA_EXCHANGE, signer);
      const tokenIn = TOKEN_ADDRESSES.MUSD;
      const tokenOut = activeAssetMeta.tokenAddress;
      const swapTx = await exchange.swap(tokenIn, tokenOut, amountIn, 0n);
      await swapTx.wait();

      onTxHashChange?.(swapTx.hash);
      await fetchBalances(provider, user);
    } catch (swapError) {
      const message = swapError?.code === 4001
        ? 'Transaction rejected by user.'
        : (swapError?.shortMessage || swapError?.message || 'Swap execution failed.');
      onError?.(message);
    } finally {
      setIsExecuting(false);
      setApprovalState('');
    }
  };

  const handleConnect = async () => {
    try {
      await connectWallet();
      onError?.('');
    } catch (connectError) {
      onError?.(connectError?.message || 'Wallet connection failed.');
    }
  };

  return (
    <div className="spectra-exchange-wrap">
      <div className="spectra-swap-box">
        <label className="spectra-swap-label">You Pay</label>
        <div className="spectra-swap-row">
          <input
            className="spectra-swap-input"
            type="text"
            inputMode="decimal"
            placeholder="0.0"
            value={payAmount}
            onChange={(event) => onPayAmountChange(event.target.value)}
          />
          <select
            className="spectra-select"
            value={activeAsset}
            onChange={(event) => onAssetChange(event.target.value)}
          >
            {ASSET_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="spectra-balance-stack">
          <span className="spectra-balance-text">Base Sepolia ETH: {ethBalance}</span>
          <span className="spectra-balance-text">Mock USD: {mockUsdBalance}</span>
        </div>
        {!account && (
          <button className="spectra-connect-btn" type="button" onClick={handleConnect}>
            Connect Wallet
          </button>
        )}
      </div>

      <div className="spectra-swap-box">
        <label className="spectra-swap-label">You Receive</label>
        <div className="spectra-swap-row">
          <input className="spectra-swap-input" type="text" placeholder="0.0" value={receiveAmount} readOnly />
          <div className="spectra-token-badge">{activeAssetMeta.label}</div>
        </div>
        <div className="spectra-balance-row">
          <span className="spectra-balance-text">Dynamic quote is based on selected asset.</span>
        </div>
      </div>

      <button className="spectra-execute-btn" type="button" onClick={handleExecuteSwap} disabled={isExecuting}>
        {isExecuting ? 'Awaiting Wallet Signature...' : 'Execute Swap'}
      </button>

      {approvalState && <div className="spectra-status-toast">{approvalState}</div>}
    </div>
  );
}
