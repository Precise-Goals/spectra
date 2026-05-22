import React, { useMemo, useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ABIS, CONTRACT_ADDRESSES, TOKEN_ADDRESSES } from '../../config/contracts.js';

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function approve(address spender, uint256 value) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

const TIERS = [
  {
    id: 'alpha',
    name: 'ALPHA',
    price: 'FREE',
    deduction: '0.00',
    plan: 0,
    badge: '/1.png',
    description: 'Read-only terminal access and public data feeds.',
    features: ['Read-only terminal access', 'Public data feeds', 'Agent deployment'],
  },
  {
    id: 'vector',
    name: 'VECTOR',
    price: '$15 / MO',
    deduction: '15.00',
    plan: 1,
    badge: '/2.png',
    description: 'Standard terminal access with private data channels.',
    features: ['Standard terminal access', 'Private data channels', '1 Concurrent Agent'],
  },
  {
    id: 'nexus',
    name: 'NEXUS',
    price: '$49 / MO',
    deduction: '49.00',
    plan: 2,
    badge: '/3.png',
    description: 'Root terminal access with unlimited data pipelines.',
    features: ['Root terminal access', 'Unlimited data pipelines', 'Infinite Agent swarm'],
  },
];

const ZERO = '0.00';

export default function MintConsole() {
  const [selectedTier, setSelectedTier] = useState('nexus');
  const [ethBalance, setEthBalance] = useState(ZERO);
  const [mockUsdBalance, setMockUsdBalance] = useState(ZERO);
  const [isMinting, setIsMinting] = useState(false);
  const [status, setStatus] = useState('IDLE');
  const [feedback, setFeedback] = useState('');
  const [txHash, setTxHash] = useState('');

  const activeTier = useMemo(() => TIERS.find((tier) => tier.id === selectedTier) || TIERS[2], [selectedTier]);

  const fetchBalances = async (provider, address) => {
    const [ethRaw, mockUsdContract] = await Promise.all([
      provider.getBalance(address),
      Promise.resolve(new ethers.Contract(TOKEN_ADDRESSES.MUSD, ERC20_ABI, provider)),
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
    await fetchBalances(provider, accounts[0]);
    return { provider, account: accounts[0] };
  };

  const approveIfNeeded = async (signer, spender, amountWei) => {
    const token = new ethers.Contract(TOKEN_ADDRESSES.MUSD, ERC20_ABI, signer);
    const owner = await signer.getAddress();
    const allowance = await token.allowance(owner, spender);

    if (allowance >= amountWei) {
      return;
    }

    setStatus('APPROVING');
    const approveTx = await token.approve(spender, ethers.MaxUint256);
    await approveTx.wait();
  };

  const handleMint = async () => {
    if (isMinting) {
      return;
    }

    setIsMinting(true);
    setFeedback('');
    setTxHash('');

    try {
      const tier = activeTier;
      if (tier.id === 'alpha') {
        throw new Error('Alpha tier is read-only and cannot mint a subscription badge.');
      }

      setStatus('CONNECTING');
      const { provider, account } = await connectWallet();
      const signer = await provider.getSigner();
      const feeAmount = ethers.parseUnits(String(tier.deduction), 18);

      await approveIfNeeded(signer, CONTRACT_ADDRESSES.SPECTRA_SAAS, feeAmount);

      setStatus('SUBSCRIBING');
      const saas = new ethers.Contract(CONTRACT_ADDRESSES.SPECTRA_SAAS, CONTRACT_ABIS.SPECTRA_SAAS, signer);
      const subscribeTx = await saas.subscribe(tier.plan);
      await subscribeTx.wait();

      setStatus('MINTING');
      const nft = new ethers.Contract(CONTRACT_ADDRESSES.SPECTRA_NFT, CONTRACT_ABIS.SPECTRA_NFT, signer);
      const mintTx = await nft.mintSubscribedNFT(`ipfs://spectra-subscription-${tier.id}`);
      await mintTx.wait();

      setTxHash(mintTx.hash);
      setStatus('MINTED');
      await fetchBalances(provider, account);
    } catch (mintError) {
      if (mintError?.code === 4001) {
        setFeedback('Transaction rejected by user.');
      } else {
        setFeedback(mintError?.shortMessage || mintError?.message || 'Mint request failed.');
      }
      setStatus('ERROR');
      setTxHash('');
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="spectra-mint-grid">
      <div className="spectra-mint-left">
        <div className="spectra-render-box">
          <div className="spectra-render-label">[ RENDER VIEW ]</div>
          <div className="spectra-status-badge">{status}</div>
          <img className="spectra-badge-image" src={activeTier.badge} alt={`${activeTier.name} badge`} />
        </div>

        <div className="spectra-action-box">
          <div className="spectra-action-head">
            <span className="spectra-action-label">Estimated Deduction</span>
            <span className="spectra-action-value">{activeTier.deduction} UGF/MO</span>
          </div>
          <button className="spectra-mint-btn" type="button" onClick={handleMint} disabled={isMinting}>
            {isMinting ? 'Awaiting Wallet Confirmation...' : 'Mint Subscription Badge'}
          </button>
          <div className="spectra-mint-status">{status === 'MINTED' ? 'SUCCESS: TRANSACTION CONFIRMED' : `STATUS: ${status}`}</div>
          <div className="spectra-balance-stack">
            <span className="spectra-balance-text">Base Sepolia ETH: {ethBalance}</span>
            <span className="spectra-balance-text">Mock USD: {mockUsdBalance}</span>
          </div>
          {txHash && <div className="spectra-tx-panel">Mint confirmed: {txHash}</div>}
          {feedback && <div className="spectra-error-box">{feedback}</div>}
        </div>
      </div>

      <div className="spectra-mint-right">
        <div className="spectra-tier-label">Select Access Tier</div>
        <div className="spectra-tier-grid">
          {TIERS.map((tier) => {
            const isActive = tier.id === selectedTier;
            return (
              <div
                key={tier.id}
                className={`spectra-tier-card ${isActive ? 'spectra-tier-card-active' : ''}`}
                onClick={() => setSelectedTier(tier.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    setSelectedTier(tier.id);
                  }
                }}
              >
                <div className="spectra-tier-top">
                  <h3 className="spectra-tier-name">{tier.name}</h3>
                  <div className="spectra-tier-price">{tier.price}</div>
                </div>
                <p className="spectra-tier-description">{tier.description}</p>
                <ul className="spectra-tier-list">
                  {tier.features.map((feature, index) => (
                    <li key={feature} className="spectra-tier-item">
                      <span className="material-symbols-outlined spectra-tier-icon">
                        {tier.id === 'alpha' && index === 2 ? 'close' : 'check'}
                      </span>
                      <span className="spectra-tier-feature">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className={`spectra-tier-foot ${isActive ? 'spectra-tier-foot-active' : ''}`}>
                  {isActive ? 'ACTIVE SELECTION' : `SELECT [ ${tier.name.charAt(0)} ]`}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
