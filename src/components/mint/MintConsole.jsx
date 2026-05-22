import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

// --- Styled Components ---

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const NFTFrame = styled(motion.div)`
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-top: 1px solid rgba(176, 38, 255, 0.2);
  border-radius: 20px;
  background: rgba(10, 10, 11, 0.6);
  backdrop-filter: blur(16px);
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  padding: 2rem;
`;

const RenderLabel = styled.div`
  position: absolute;
  top: 1rem;
  left: 1.25rem;
  font-family: 'Geist Mono', monospace;
  font-size: 0.62rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.25);
`;

const StatusBadge = styled.div`
  position: absolute;
  top: 1rem;
  right: 1.25rem;
  font-family: 'Geist Mono', monospace;
  font-size: 0.65rem;
  letter-spacing: 0.08em;
  color: ${({ minting }) => minting ? 'rgba(176,38,255,0.9)' : 'rgba(255,255,255,0.25)'};
  border: 1px solid ${({ minting }) => minting ? 'rgba(176,38,255,0.3)' : 'rgba(255,255,255,0.1)'};
  padding: 0.2rem 0.5rem;
  border-radius: 5px;
  transition: all 0.4s ease;
`;

const rotateWire = keyframes`
  from { transform: rotateY(0deg) rotateX(15deg); }
  to { transform: rotateY(360deg) rotateX(15deg); }
`;

const WireframeCube = styled.div`
  width: 140px;
  height: 140px;
  position: relative;
  perspective: 600px;
  svg {
    animation: ${rotateWire} ${({ minting }) => minting ? '1.5s' : '12s'} linear infinite;
    stroke: ${({ minting }) => minting ? 'rgba(176,38,255,0.8)' : 'rgba(255,255,255,0.25)'};
    filter: ${({ minting }) => minting ? 'drop-shadow(0 0 8px rgba(176,38,255,0.6))' : 'none'};
    transition: stroke 0.4s ease, filter 0.4s ease;
  }
`;

const ActionPanel = styled(motion.div)`
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.02);
  padding: 1.25rem;
`;

const CostRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const CostLabel = styled.span`
  font-family: 'Geist Mono', monospace;
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.3);
`;

const CostValue = styled.span`
  font-family: 'Geist Mono', monospace;
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
`;

const MintButton = styled(motion.button)`
  width: 100%;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid ${({ minting, success }) =>
    success ? 'rgba(100,220,150,0.4)' : minting ? 'rgba(176,38,255,0.5)' : 'rgba(255,255,255,0.08)'};
  background: ${({ minting, success }) =>
    success
      ? 'rgba(100,220,150,0.1)'
      : minting
      ? 'rgba(176,38,255,0.12)'
      : 'rgba(255,255,255,0.03)'};
  color: ${({ minting, success }) =>
    success ? 'rgba(100,220,150,0.9)' : minting ? 'rgba(176,38,255,0.9)' : 'rgba(255,255,255,0.7)'};
  font-family: 'Geist Mono', monospace;
  font-size: 0.78rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  &:not(:disabled):hover {
    background: rgba(176, 38, 255, 0.15);
    border-color: rgba(176, 38, 255, 0.4);
    color: rgba(176, 38, 255, 1);
    box-shadow: 0 4px 20px rgba(176, 38, 255, 0.2);
  }
`;

const ProgressBar = styled(motion.div)`
  height: 2px;
  background: linear-gradient(90deg, #B026FF, #FF26E1);
  border-radius: 1px;
  margin-top: 0.75rem;
  box-shadow: 0 0 8px rgba(176, 38, 255, 0.5);
`;

const StatusMessage = styled(motion.div)`
  font-family: 'Geist Mono', monospace;
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  color: rgba(176, 38, 255, 0.7);
  margin-top: 0.5rem;
  text-align: center;
`;

const steps = [
  '[ INITIALIZING CONTRACT... ]',
  '[ VERIFYING UGF BALANCE... ]',
  '[ DEDUCTING FUNDS... ]',
  '[ MINTING BADGE... ]',
];

/**
 * @param {object} props
 * @param {{ name: string, cost: number }} props.selectedTier
 */
export default function MintConsole({ selectedTier = { name: 'NEXUS', cost: 49 } }) {
  const [minting, setMinting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');

  const handleMint = () => {
    if (minting || success) return;
    setMinting(true);
    setProgress(0);
    let stepIdx = 0;
    setStatusMsg(steps[0]);

    const interval = setInterval(() => {
      stepIdx++;
      const pct = (stepIdx / steps.length) * 100;
      setProgress(pct);
      if (stepIdx < steps.length) setStatusMsg(steps[stepIdx]);

      if (stepIdx >= steps.length) {
        clearInterval(interval);
        setMinting(false);
        setSuccess(true);
        setStatusMsg('[ SUCCESS: TRANSACTION CONFIRMED ]');
        setTimeout(() => {
          setSuccess(false);
          setProgress(0);
          setStatusMsg('');
        }, 4000);
      }
    }, 800);
  };

  const buttonLabel = success
    ? 'MINT SUCCESSFUL'
    : minting
    ? 'PROCESSING...'
    : 'MINT SUBSCRIPTION BADGE';

  return (
    <Wrapper>
      <NFTFrame
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: 'spring', damping: 25, stiffness: 80 }}
      >
        <RenderLabel>[ Render View ]</RenderLabel>
        <StatusBadge minting={minting || success}>
          {success ? 'MINTED' : minting ? 'MINTING' : 'IDLE'}
        </StatusBadge>

        <WireframeCube minting={minting}>
          <svg viewBox="0 0 100 100" width="140" height="140" fill="none" strokeWidth="0.6">
            <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" />
            <line x1="50" y1="10" x2="50" y2="50" />
            <line x1="90" y1="30" x2="50" y2="50" />
            <line x1="10" y1="30" x2="50" y2="50" />
            <line x1="50" y1="50" x2="50" y2="90" />
            <line x1="10" y1="70" x2="50" y2="50" />
            <line x1="90" y1="70" x2="50" y2="50" />
          </svg>
        </WireframeCube>
      </NFTFrame>

      <ActionPanel
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1, type: 'spring', damping: 25, stiffness: 80 }}
      >
        <CostRow>
          <CostLabel>Estimated Deduction</CostLabel>
          <CostValue>{selectedTier.cost}.00 UGF/MO</CostValue>
        </CostRow>

        <MintButton
          disabled={minting}
          minting={minting}
          success={success}
          onClick={handleMint}
          whileTap={!minting ? { scale: 0.98 } : {}}
        >
          {buttonLabel}
        </MintButton>

        <AnimatePresence>
          {(minting || success) && (
            <>
              <ProgressBar
                key="progress"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
              <StatusMessage
                key="status"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {statusMsg}
              </StatusMessage>
            </>
          )}
        </AnimatePresence>
      </ActionPanel>
    </Wrapper>
  );
}
