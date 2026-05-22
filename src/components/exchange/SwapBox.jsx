import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

// --- Styled Components ---

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 100%;
  max-width: 480px;
`;

const Label = styled.span`
  font-family: 'Geist Mono', monospace;
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.35);
  display: block;
  margin-bottom: 0.4rem;
`;

const InputBox = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: all 0.3s ease;
  &:focus-within {
    border-color: rgba(176, 38, 255, 0.4);
    background: rgba(255, 255, 255, 0.04);
    box-shadow: 0 0 0 4px rgba(176, 38, 255, 0.08);
  }
`;

const InputRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
`;

const AmountInput = styled.input`
  background: transparent;
  border: none;
  outline: none;
  font-family: 'Geist Mono', monospace;
  font-size: 2rem;
  font-weight: 600;
  color: #ffffff;
  width: 100%;
  &::placeholder { color: rgba(255, 255, 255, 0.15); }
`;

const TokenButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.25s ease;
  &:hover {
    background: rgba(176, 38, 255, 0.1);
    border-color: rgba(176, 38, 255, 0.3);
    color: #ffffff;
  }
`;

const BalanceRow = styled.div`
  font-family: 'Geist Mono', monospace;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.3);
`;

const SwapDivider = styled.div`
  display: flex;
  justify-content: center;
  margin: -12px 0;
  position: relative;
  z-index: 2;
`;

const SwapButton = styled(motion.button)`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(10, 10, 11, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: rgba(176, 38, 255, 0.7);
  transition: all 0.25s ease;
  &:hover {
    border-color: rgba(176, 38, 255, 0.35);
    background: rgba(176, 38, 255, 0.08);
    color: rgba(176, 38, 255, 1);
  }
`;

const SwapArrow = styled.span`
  font-size: 1.1rem;
`;

/**
 * @param {object} props
 * @param {string} props.payAmount
 * @param {function} props.onPayAmountChange
 * @param {string} props.payToken  e.g. "Mock USD"
 * @param {string} props.payBalance
 * @param {string} props.receiveAmount
 * @param {string} props.receiveToken e.g. "Select Token"
 * @param {function} props.onSwapTokens
 */
export default function SwapBox({
  payAmount,
  onPayAmountChange,
  payToken = 'Mock USD',
  payBalance = '14,250.00 MUSD',
  receiveAmount = '',
  receiveToken = 'Select Token',
  onSwapTokens,
}) {
  return (
    <Wrapper>
      {/* You Pay */}
      <InputBox>
        <Label>You Pay</Label>
        <InputRow>
          <AmountInput
            type="text"
            placeholder="0.0"
            value={payAmount}
            onChange={(e) => onPayAmountChange && onPayAmountChange(e.target.value)}
            inputMode="decimal"
          />
          <TokenButton whileTap={{ scale: 0.95 }}>
            {payToken}
            <ChevronDown size={14} />
          </TokenButton>
        </InputRow>
        <BalanceRow>Balance: {payBalance}</BalanceRow>
      </InputBox>

      {/* Divider */}
      <SwapDivider>
        <SwapButton
          whileTap={{ rotate: 180, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          onClick={onSwapTokens}
        >
          <SwapArrow>⇅</SwapArrow>
        </SwapButton>
      </SwapDivider>

      {/* You Receive */}
      <InputBox>
        <Label>You Receive</Label>
        <InputRow>
          <AmountInput
            type="text"
            placeholder="0.0"
            value={receiveAmount}
            readOnly
            style={{ color: receiveAmount ? '#ffffff' : 'rgba(255,255,255,0.15)' }}
          />
          <TokenButton
            whileTap={{ scale: 0.95 }}
            style={
              receiveToken === 'Select Token'
                ? { background: 'rgba(176,38,255,0.15)', borderColor: 'rgba(176,38,255,0.3)', color: 'rgba(176,38,255,0.9)' }
                : {}
            }
          >
            {receiveToken}
            <ChevronDown size={14} />
          </TokenButton>
        </InputRow>
        <BalanceRow style={{ opacity: 0 }}>Balance: 0.00</BalanceRow>
      </InputBox>
    </Wrapper>
  );
}
