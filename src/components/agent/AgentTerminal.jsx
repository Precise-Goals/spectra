import React, { useMemo, useState } from 'react';
import { ethers } from 'ethers';
import { tryParseDefiIntent } from '../../api/sarvamAgent.js';
import { CONTRACT_ABIS, CONTRACT_ADDRESSES, TOKEN_ADDRESSES } from '../../config/contracts.js';

function buildIntentJson(intent) {
  return {
    intent_id: `0x${ethers.id(`${intent.action}:${intent.amount}:${intent.token}:${Date.now()}`).slice(2, 10)}...${Date.now().toString(16).slice(-4)}`,
    trigger: {
      type: 'USER_SIGNATURE',
      network: 'base_sepolia',
      condition: 'immediate',
    },
    execution_graph: [
      {
        step: 1,
        action: intent.action.toUpperCase(),
        amount: intent.amount,
        asset: intent.token,
        venue: 'SPECTRA_EXCHANGE',
      },
    ],
    estimated_fees: 'wallet-estimated',
  };
}

export default function AgentTerminal() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [intent, setIntent] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [status, setStatus] = useState('READY');
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');

  const intentJson = useMemo(() => {
    if (!intent) {
      return null;
    }
    return buildIntentJson(intent);
  }, [intent]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      throw new Error('No injected wallet found. Install MetaMask or a compatible wallet.');
    }

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (!accounts?.length) {
      throw new Error('Wallet returned no accounts.');
    }
    setWalletAddress(accounts[0]);
    return accounts[0];
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!prompt.trim() || isLoading) {
      return;
    }

    setIsLoading(true);
    setError('');
    setTxHash('');
    setStatus('PARSING');
    setIntent(null);

    try {
      const result = await tryParseDefiIntent(prompt.trim());
      if (!result || result.action === 'unknown') {
        setError('Intent parsing failed. Provide a concrete on-chain action like "swap 10 MUSD to ETH".');
        setStatus('ERROR');
      } else {
        setIntent(result);
        setStatus('READY');
      }
    } catch (parseError) {
      setError(parseError?.message || 'Agent parser request failed.');
      setStatus('ERROR');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignAndExecute = async () => {
    if (!intent || isExecuting) {
      return;
    }

    setError('');
    setTxHash('');
    setIsExecuting(true);
    setStatus('AWAITING_SIGNATURE');

    try {
      const account = walletAddress || (await connectWallet());
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();

      const domain = {
        name: 'SpectraIntentEngine',
        version: '1',
        chainId: Number(network.chainId),
        verifyingContract: CONTRACT_ADDRESSES.SPECTRA_EXCHANGE,
      };

      const types = {
        SpectraIntent: [
          { name: 'action', type: 'string' },
          { name: 'amount', type: 'string' },
          { name: 'token', type: 'string' },
          { name: 'timestamp', type: 'uint256' },
        ],
      };

      const value = {
        action: intent.action,
        amount: String(intent.amount),
        token: intent.token,
        timestamp: BigInt(Date.now()),
      };

      await signer.signTypedData(domain, types, value);

      setStatus('SUBMITTING_TRANSACTION');

      const tokenOut = TOKEN_ADDRESSES[intent.token] || TOKEN_ADDRESSES.MUSD;
      const amountIn = ethers.parseUnits(String(intent.amount || '0'), 18);
      const iface = new ethers.Interface(CONTRACT_ABIS.SPECTRA_EXCHANGE);
      const data = iface.encodeFunctionData('swap', [
        TOKEN_ADDRESSES.MUSD,
        tokenOut,
        amountIn,
        0n,
      ]);

      const hash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: account,
            to: CONTRACT_ADDRESSES.SPECTRA_EXCHANGE,
            data,
            value: '0x0',
          },
        ],
      });

      setTxHash(hash);
      setStatus('EXECUTED');
    } catch (executionError) {
      if (executionError?.code === 4001) {
        setError('Signature or transaction rejected by user.');
      } else {
        setError(executionError?.message || 'Execution failed.');
      }
      setStatus('ERROR');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="spectra-agent-page">
      <div className="spectra-agent-terminal-shell">
        <div className="spectra-agent-terminal-header">
          <div className="spectra-agent-header-left">
            <span className="material-symbols-outlined spectra-agent-header-icon">terminal</span>
            <span className="spectra-agent-header-title">AGENTIC_WALLET_OS // ACTIVE_MODE</span>
          </div>
          <div className="spectra-agent-header-right">
            <span className="spectra-agent-dot" />
            <span className="spectra-agent-dot" />
            <span className="spectra-agent-dot" />
          </div>
        </div>

        <div className="spectra-agent-chat">
          <div className="spectra-agent-card spectra-agent-card-user">
            <span className="spectra-agent-label">USER_INPUT</span>
            <div className="spectra-agent-bubble">{prompt || 'Type an on-chain instruction below.'}</div>
          </div>

          <div className="spectra-agent-card spectra-agent-card-system">
            <span className="spectra-agent-label">SYSTEM_AGENT</span>
            <div className="spectra-agent-bubble">
              <div className="spectra-agent-system-lines">
                <p className="spectra-agent-line">&gt; Parsing intent...</p>
                <p className="spectra-agent-line">&gt; Constructing transaction payload...</p>
                <p className="spectra-agent-line">
                  &gt; Status: <span className="spectra-agent-status">[ {status} ]</span>
                </p>
              </div>

              <div className="spectra-agent-json">
                <pre className="spectra-agent-pre">
                  {JSON.stringify(intentJson || {
                    intent_id: 'pending',
                    trigger: { type: 'USER_SIGNATURE', network: 'base_sepolia', condition: 'awaiting_prompt' },
                    execution_graph: [],
                    estimated_fees: 'wallet-estimated',
                  }, null, 2)}
                </pre>
              </div>

              <button
                type="button"
                className="spectra-agent-cta"
                onClick={handleSignAndExecute}
                disabled={!intent || isExecuting}
              >
                <span className="material-symbols-outlined spectra-agent-cta-icon">signature</span>
                <span className="spectra-agent-cta-text">{isExecuting ? 'Awaiting Wallet...' : 'Sign & Execute (EIP-712)'}</span>
              </button>

              {walletAddress && (
                <p className="spectra-agent-line spectra-agent-wallet">Connected: {walletAddress}</p>
              )}
              {txHash && (
                <p className="spectra-agent-line spectra-agent-wallet">Tx Hash: {txHash}</p>
              )}
            </div>
          </div>

          {error && <div className="spectra-agent-error">{error}</div>}
        </div>

        <form className="spectra-agent-input-row" onSubmit={handleSubmit}>
          <span className="material-symbols-outlined spectra-agent-input-icon">chevron_right</span>
          <input
            className="spectra-agent-input"
            placeholder="What onchain action can I route for you?"
            type="text"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            disabled={isLoading || isExecuting}
          />
          <button className="spectra-agent-submit" type="submit" disabled={isLoading || isExecuting || !prompt.trim()}>
            {isLoading ? '[ PARSING ]' : '[ SUBMIT ]'}
          </button>
        </form>
      </div>
    </div>
  );
}
