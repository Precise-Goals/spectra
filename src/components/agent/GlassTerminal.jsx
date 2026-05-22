import React, { useMemo, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { ethers } from 'ethers';
import { tryParseDefiIntent } from '../../api/sarvamAgent.js';
import { CONTRACT_ABIS, CONTRACT_ADDRESSES, TOKEN_ADDRESSES } from '../../config/contracts.js';

const Card = styled.section`
  width: 100%;
  max-width: 980px;
  background: rgba(10, 10, 11, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 20px 70px rgba(176, 38, 255, 0.14);
  overflow: hidden;
`;

const Header = styled.header`
  height: 52px;
  padding: 0 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderTitle = styled.div`
  font-family: 'Geist', monospace;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const Dots = styled.div`
  display: inline-flex;
  gap: 8px;

  span {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.35);
  }
`;

const Body = styled.div`
  min-height: 520px;
  max-height: 70vh;
  overflow-y: auto;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const EmptyState = styled.div`
  border: 1px dashed rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.02);
  color: #e5e5e5;
  font-family: 'Geist', monospace;
  font-size: 14px;
  padding: 18px;
`;

const Message = styled.div`
  align-self: ${({ $agent }) => ($agent ? 'flex-start' : 'flex-end')};
  width: min(88%, 760px);
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const MessageLabel = styled.span`
  font-family: 'Geist', monospace;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #e5e5e5;
`;

const MessageBubble = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: ${({ $agent }) => ($agent ? 'rgba(255,255,255,0.04)' : 'rgba(176,38,255,0.15)')};
  color: #ffffff;
  font-family: 'Geist', monospace;
  font-size: 14px;
  line-height: 1.6;
  padding: 12px 14px;
`;

const glowPulse = keyframes`
  0% { transform: scale(0.9) rotate(0deg); opacity: 0.35; }
  50% { transform: scale(1.08) rotate(180deg); opacity: 1; }
  100% { transform: scale(0.9) rotate(360deg); opacity: 0.35; }
`;

const LoaderWrap = styled.div`
  align-self: flex-start;
  width: min(88%, 760px);
  border: 1px solid rgba(176, 38, 255, 0.55);
  background: rgba(176, 38, 255, 0.08);
  padding: 14px;
  display: inline-flex;
  align-items: center;
  gap: 12px;
`;

const LoaderGeo = styled.div`
  width: 18px;
  height: 18px;
  border: 2px solid #b026ff;
  box-shadow: 0 0 14px rgba(176, 38, 255, 0.7);
  animation: ${glowPulse} 1.1s linear infinite;
`;

const LoaderText = styled.span`
  color: #ffffff;
  font-family: 'Geist', monospace;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const IntentCard = styled.article`
  border: 1px solid rgba(176, 38, 255, 0.6);
  background: rgba(176, 38, 255, 0.12);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const IntentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const IntentItem = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(10, 10, 11, 0.45);
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const IntentLabel = styled.span`
  font-family: 'Geist', monospace;
  font-size: 10px;
  color: #e5e5e5;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const IntentValue = styled.span`
  font-family: 'Geist', monospace;
  font-size: 14px;
  color: #ffffff;
  text-transform: uppercase;
`;

const ExecuteButton = styled.button`
  width: 100%;
  border: 1px solid #b026ff;
  color: #ffffff;
  background: rgba(176, 38, 255, 0.2);
  padding: 12px;
  font-family: 'Geist', monospace;
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;

  &:hover:not(:disabled) {
    box-shadow: 0 0 20px rgba(176, 38, 255, 0.45);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Footer = styled.form`
  height: 74px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
`;

const Input = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  color: #ffffff;
  font-family: 'Geist', monospace;
  font-size: 15px;

  &::placeholder {
    color: #e5e5e5;
    opacity: 0.7;
  }

  &:focus {
    outline: none;
  }
`;

const SendButton = styled.button`
  border: 1px solid #b026ff;
  color: #ffffff;
  background: rgba(176, 38, 255, 0.2);
  padding: 9px 14px;
  font-family: 'Geist', monospace;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.1em;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatusText = styled.p`
  font-family: 'Geist', monospace;
  font-size: 12px;
  color: #e5e5e5;
`;

const ErrorBox = styled.div`
  border: 1px solid rgba(239, 68, 68, 0.65);
  background: rgba(239, 68, 68, 0.1);
  color: #ffffff;
  font-family: 'Geist', monospace;
  font-size: 12px;
  padding: 10px;
`;

function buildTypedData(intent, chainId) {
  const domain = {
    name: 'SpectraIntentEngine',
    version: '1',
    chainId,
    verifyingContract: CONTRACT_ADDRESSES.SPECTRA_EXCHANGE,
  };

  const types = {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ],
    SpectraIntent: [
      { name: 'action', type: 'string' },
      { name: 'amount', type: 'string' },
      { name: 'token', type: 'string' },
      { name: 'nonce', type: 'uint256' },
    ],
  };

  const message = {
    action: String(intent.action || ''),
    amount: String(intent.amount || '0'),
    token: String(intent.token || 'UNKNOWN').toUpperCase(),
    nonce: Date.now(),
  };

  return { domain, types, primaryType: 'SpectraIntent', message };
}

export default function GlassTerminal() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [intent, setIntent] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [error, setError] = useState('');
  const [signature, setSignature] = useState('');

  const statusText = useMemo(() => {
    if (isSigning) {
      return 'Awaiting wallet signature...';
    }
    if (signature) {
      return `Signature captured: ${signature.slice(0, 16)}...`;
    }
    if (walletAddress) {
      return `Wallet connected: ${walletAddress}`;
    }
    return 'Wallet disconnected';
  }, [isSigning, signature, walletAddress]);

  const pushMessage = (from, content) => {
    setMessages((prev) => [...prev, { from, content }]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!inputValue.trim() || isLoading) {
      return;
    }

    setError('');
    setIntent(null);
    setSignature('');
    setIsLoading(true);

    const userPrompt = inputValue.trim();
    pushMessage('user', userPrompt);

    try {
      const parsed = await tryParseDefiIntent(userPrompt);
      if (!parsed || parsed.action === 'unknown') {
        throw new Error('Agent could not derive a valid on-chain intent from your input.');
      }

      pushMessage('agent', `Intent resolved: ${parsed.action.toUpperCase()} ${parsed.amount} ${String(parsed.token).toUpperCase()}`);
      setIntent(parsed);
      setInputValue('');
    } catch (apiError) {
      setError(apiError?.message || 'Failed to contact agent backend.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignAndExecute = async () => {
    if (!intent || isSigning) {
      return;
    }

    setError('');
    setIsSigning(true);

    try {
      if (!window.ethereum) {
        throw new Error('No injected wallet found.');
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (!accounts?.length) {
        throw new Error('Wallet returned no accounts.');
      }

      const from = accounts[0];
      setWalletAddress(from);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      const typedData = buildTypedData(intent, Number(network.chainId));

      const signed = await window.ethereum.request({
        method: 'eth_signTypedData_v4',
        params: [from, JSON.stringify(typedData)],
      });

      setSignature(signed);
      pushMessage('agent', 'Signature captured. Relaying to UGF network...');

      const signer = await provider.getSigner();
      const tokenOut = TOKEN_ADDRESSES[intent.token] || TOKEN_ADDRESSES.MUSD;
      const amountIn = ethers.parseUnits(String(intent.amount || '0'), 18);
      const iface = new ethers.Interface(CONTRACT_ABIS.SPECTRA_EXCHANGE);
      const data = iface.encodeFunctionData('swap', [TOKEN_ADDRESSES.MUSD, tokenOut, amountIn, 0n]);

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from,
            to: CONTRACT_ADDRESSES.SPECTRA_EXCHANGE,
            data,
            value: '0x0',
          },
        ],
      });

      const receipt = await provider.waitForTransaction(txHash);
      if (!receipt) {
        throw new Error('Transaction was submitted but no receipt was returned.');
      }
      pushMessage('agent', `✅ Transaction executed successfully on Base Sepolia. Hash: ${txHash}`);
    } catch (signError) {
      if (signError?.code === 4001) {
        setError('Signature or transaction rejected by user.');
      } else {
        setError(signError?.shortMessage || signError?.message || 'Execution failed.');
      }
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <Card>
      <Header>
        <HeaderTitle>
          <span className="material-symbols-outlined">terminal</span>
          AGENTIC_WALLET_OS // ACTIVE_MODE
        </HeaderTitle>
        <Dots>
          <span />
          <span />
          <span />
        </Dots>
      </Header>

      <Body>
        {messages.length === 0 && !isLoading && (
          <EmptyState>Agent terminal is idle. Send an on-chain instruction to start.</EmptyState>
        )}

        {messages.map((msg, idx) => (
          <Message key={`${msg.from}-${idx}`} $agent={msg.from === 'agent'}>
            <MessageLabel>{msg.from === 'agent' ? 'SYSTEM_AGENT' : 'USER_INPUT'}</MessageLabel>
            <MessageBubble $agent={msg.from === 'agent'}>{msg.content}</MessageBubble>
          </Message>
        ))}

        {isLoading && (
          <LoaderWrap>
            <LoaderGeo />
            <LoaderText>Parsing intent via Sarvam Agent...</LoaderText>
          </LoaderWrap>
        )}

        {intent && (
          <IntentCard>
            <IntentGrid>
              <IntentItem>
                <IntentLabel>Action</IntentLabel>
                <IntentValue>{intent.action}</IntentValue>
              </IntentItem>
              <IntentItem>
                <IntentLabel>Amount</IntentLabel>
                <IntentValue>{intent.amount}</IntentValue>
              </IntentItem>
              <IntentItem>
                <IntentLabel>Token</IntentLabel>
                <IntentValue>{intent.token}</IntentValue>
              </IntentItem>
            </IntentGrid>
            <ExecuteButton type="button" onClick={handleSignAndExecute} disabled={isSigning}>
              {isSigning ? 'Awaiting Signature...' : 'Sign & Execute'}
            </ExecuteButton>
          </IntentCard>
        )}

        <StatusText>{statusText}</StatusText>
        {error && <ErrorBox>{error}</ErrorBox>}
      </Body>

      <Footer onSubmit={handleSubmit}>
        <span className="material-symbols-outlined">chevron_right</span>
        <Input
          type="text"
          placeholder="What onchain action can I route for you?"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          disabled={isLoading || isSigning}
        />
        <SendButton type="submit" disabled={isLoading || isSigning || !inputValue.trim()}>
          Send
        </SendButton>
      </Footer>
    </Card>
  );
}
