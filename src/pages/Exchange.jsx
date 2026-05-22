import React, { useState } from 'react';
import styled from 'styled-components';

/* ─── Styled ─────────────────────────────────────────────────────────────────── */

const PageWrap = styled.main`
  flex: 1;
  padding-top: 120px;
  padding-bottom: 96px;
  padding-left: 16px;
  padding-right: 16px;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 819px;

  @media (min-width: 768px) {
    padding-left: 64px;
    padding-right: 64px;
  }
`;

const Inner = styled.div`
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const PageHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

const PageTitle = styled.h1`
  font-family: 'Poppins', sans-serif;
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.04em;
  color: var(--color-primary);
  text-transform: uppercase;
`;

const PageSub = styled.p`
  font-family: 'Geist', monospace;
  font-size: 12px;
  letter-spacing: 0.02em;
  color: var(--color-secondary);
`;

/* ── Swap Interface ── */
const SwapGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SwapBox = styled.div`
  border: 1px solid var(--border-color);
  background: var(--bg-surface);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: border-width 0.15s ease;

  &:focus-within {
    border-width: 2px;
    margin: -1px;
  }
`;

const SwapLabel = styled.label`
  font-family: 'Geist', monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-primary);
`;

const SwapRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const AmountInput = styled.input`
  background: transparent;
  border: none;
  outline: none;
  font-family: 'Geist', monospace;
  font-size: 32px;
  font-weight: 500;
  letter-spacing: -0.02em;
  color: var(--color-primary);
  width: 100%;
  padding: 0;

  &::placeholder { color: var(--bg-surface-container); }
`;

const TokenButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  background: ${({ $selected }) => $selected ? 'var(--color-primary)' : 'var(--bg)'};
  color: ${({ $selected }) => $selected ? 'var(--color-on-primary)' : 'var(--color-primary)'};
  font-family: 'Geist', monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    background: var(--color-primary);
    color: var(--color-on-primary);
  }

  .material-symbols-outlined { font-size: 16px; }
`;

const BalanceRow = styled.div`
  font-family: 'Geist', monospace;
  font-size: 14px;
  letter-spacing: 0.02em;
  color: var(--color-secondary);
  font-variant-numeric: tabular-nums;
`;

/* ── Divider ── */
const SwapDivider = styled.div`
  display: flex;
  justify-content: center;
  position: relative;
  z-index: 10;
  margin: -12px 0;
`;

const SwapToggle = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  cursor: pointer;
  color: var(--color-primary);

  &:hover {
    background: var(--color-primary);
    color: var(--color-on-primary);
  }

  .material-symbols-outlined {
    font-size: 20px;
    transition: transform 0.3s ease;
  }

  &:hover .material-symbols-outlined {
    transform: rotate(180deg);
  }
`;

/* ── Transaction Details ── */
const TxDetails = styled.div`
  border: 1px solid var(--border-color);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const TxRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TxLabel = styled.span`
  font-family: 'Geist', monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-secondary);
`;

const TxValue = styled.span`
  font-family: 'Geist', monospace;
  font-size: 14px;
  letter-spacing: 0.02em;
  color: var(--color-primary);
  font-variant-numeric: tabular-nums;
  font-weight: ${({ $bold }) => $bold ? '600' : '300'};
  display: flex;
  align-items: center;
  gap: 8px;

  .material-symbols-outlined { font-size: 14px; }
`;

const TxDivider = styled.div`
  height: 1px;
  background: var(--border-color);
`;

/* ── CTA ── */
const ExecuteButton = styled.button`
  width: 100%;
  padding: 16px;
  border: 1px solid var(--border-color);
  background: var(--bg-surface);
  color: var(--color-primary);
  font-family: 'Geist', monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;

  &:hover {
    background: var(--color-primary);
    color: var(--color-on-primary);
  }
`;

/* ─── Component ──────────────────────────────────────────────────────────────── */
export default function Exchange() {
  const [payAmount, setPayAmount] = useState('1000.00');

  return (
    <PageWrap>
      <Inner>
        <PageHeader>
          <PageTitle>[ Exchange_Node ]</PageTitle>
          <PageSub>GASLESS SWAP PROTOCOL INITIALIZED.</PageSub>
        </PageHeader>

        {/* Swap Interface */}
        <SwapGroup>
          {/* You Pay */}
          <SwapBox>
            <SwapLabel>You Pay</SwapLabel>
            <SwapRow>
              <AmountInput
                type="text"
                placeholder="0.0"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                inputMode="decimal"
              />
              <TokenButton>
                Mock USD
                <span className="material-symbols-outlined">expand_more</span>
              </TokenButton>
            </SwapRow>
            <BalanceRow>Balance: 14,250.00 MUSD</BalanceRow>
          </SwapBox>

          {/* Divider */}
          <SwapDivider>
            <SwapToggle aria-label="Swap direction">
              <span className="material-symbols-outlined">swap_vert</span>
            </SwapToggle>
          </SwapDivider>

          {/* You Receive */}
          <SwapBox>
            <SwapLabel>You Receive</SwapLabel>
            <SwapRow>
              <AmountInput type="text" placeholder="0.0" readOnly value="" />
              <TokenButton $selected>
                Select Token
                <span className="material-symbols-outlined">expand_more</span>
              </TokenButton>
            </SwapRow>
            <BalanceRow style={{ opacity: 0 }}>Balance: 0.00</BalanceRow>
          </SwapBox>
        </SwapGroup>

        {/* Transaction Details */}
        <TxDetails>
          <TxRow>
            <TxLabel>Exchange Rate</TxLabel>
            <TxValue>1 MUSD = --</TxValue>
          </TxRow>
          <TxRow>
            <TxLabel>Gas Fee</TxLabel>
            <TxValue $bold>0 ETH (Settled via UGF)</TxValue>
          </TxRow>
          <TxRow>
            <TxLabel>Slippage Tolerance</TxLabel>
            <TxValue>0.5%</TxValue>
          </TxRow>
          <TxDivider />
          <TxRow>
            <TxLabel>Route</TxLabel>
            <TxValue>
              Spectra AMM
              <span className="material-symbols-outlined">bolt</span>
              Optimized
            </TxValue>
          </TxRow>
        </TxDetails>

        <ExecuteButton onClick={() => console.log('[Exchange] Execute gasless swap')}>
          Execute Gasless Swap
        </ExecuteButton>
      </Inner>
    </PageWrap>
  );
}
