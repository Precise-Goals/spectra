import React, { useState } from 'react';
import styled from 'styled-components';

/* ─── Styled ─────────────────────────────────────────────────────────────────── */

const PageWrap = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: 128px;
  padding-bottom: 64px;
  padding-left: 16px;
  padding-right: 16px;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;

  @media (min-width: 768px) {
    padding-left: 64px;
    padding-right: 64px;
  }

  /* grid background */
  background-size: 40px 40px;
  background-image:
    linear-gradient(to right, var(--grid-color) 1px, transparent 1px),
    linear-gradient(to bottom, var(--grid-color) 1px, transparent 1px);
`;

const PageHeader = styled.header`
  grid-column: 1 / -1;
  margin-bottom: 64px;
  padding-top: 32px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 32px;
`;

const PageTitle = styled.h1`
  font-family: 'Poppins', sans-serif;
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.04em;
  color: var(--color-primary);
  margin-bottom: 16px;
`;

const PageSub = styled.p`
  font-family: 'Poppins', sans-serif;
  font-size: 18px;
  font-weight: 400;
  line-height: 1.6;
  color: var(--color-secondary);
  max-width: 640px;
`;

const MainGrid = styled.main`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;

  @media (min-width: 1024px) {
    grid-template-columns: 5fr 7fr;
  }
`;

/* ── Left: Console ── */
const LeftCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const RenderBox = styled.div`
  border: 1px solid var(--border-color);
  background: var(--bg-surface);
  padding: 32px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
`;

const RenderLabel = styled.div`
  position: absolute;
  top: 16px;
  left: 16px;
  font-family: 'Geist', monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-secondary);
`;

const StatusTag = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  font-family: 'Geist', monospace;
  font-size: 14px;
  letter-spacing: 0.02em;
  color: ${({ $minting }) => $minting ? 'var(--color-on-primary)' : 'var(--color-primary)'};
  background: ${({ $minting }) => $minting ? 'var(--color-primary)' : 'transparent'};
  border: 1px solid var(--border-color);
  padding: 4px 8px;
`;

const CubeSvg = styled.svg`
  stroke: var(--color-primary);
  fill: none;
  stroke-width: 0.5;

  animation: rotateCube 12s linear infinite;
  animation-play-state: ${({ $minting }) => $minting ? 'running' : 'running'};
  animation-duration: ${({ $minting }) => $minting ? '1.5s' : '12s'};

  @keyframes rotateCube {
    from { transform: rotateY(0deg) rotateX(10deg); }
    to   { transform: rotateY(360deg) rotateX(10deg); }
  }
`;

const ActionBox = styled.div`
  border: 1px solid var(--border-color);
  background: var(--bg-surface);
  padding: 24px;
`;

const ActionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
`;

const ActionLabel = styled.span`
  font-family: 'Geist', monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-secondary);
`;

const ActionValue = styled.span`
  font-family: 'Geist', monospace;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--color-primary);
`;

const MintBtn = styled.button`
  width: 100%;
  padding: 16px;
  border: 1px solid var(--border-color);
  background: ${({ $success }) => $success ? 'var(--color-primary)' : 'var(--bg-surface)'};
  color: ${({ $success }) => $success ? 'var(--color-on-primary)' : 'var(--color-primary)'};
  font-family: 'Geist', monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover:not(:disabled) {
    background: var(--color-primary);
    color: var(--color-on-primary);
  }

  &.loading-state {
    animation: pulse-border 1.5s infinite;
    @keyframes pulse-border {
      0%   { border-color: transparent; }
      50%  { border-color: var(--border-color); }
      100% { border-color: transparent; }
    }
  }
`;

const ProgressFill = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: ${({ $pct }) => $pct}%;
  background: var(--color-primary);
  opacity: 0.15;
  transition: width 0.4s ease;
`;

const StatusMsg = styled.div`
  margin-top: 16px;
  font-family: 'Geist', monospace;
  font-size: 14px;
  letter-spacing: 0.02em;
  color: var(--color-secondary);
  text-align: center;
`;

/* ── Right: Tier Matrix ── */
const RightCol = styled.div`
  display: flex;
  flex-direction: column;
`;

const TierLabel = styled.div`
  font-family: 'Geist', monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-secondary);
  margin-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 8px;
`;

const TierGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  border: 1px solid var(--border-color);
  background: var(--bg-surface);

  @media (min-width: 640px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const TierCard = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  border-right: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);

  @media (min-width: 640px) {
    border-bottom: none;
  }

  &:last-child { border-right: none; }

  background: ${({ $active }) => $active ? 'var(--color-primary)' : 'var(--bg-surface)'};
  color: ${({ $active }) => $active ? 'var(--color-on-primary)' : 'var(--color-primary)'};

  &:hover {
    background: ${({ $active }) => $active ? 'var(--color-primary)' : 'var(--bg-surface-container)'};
  }
`;

const TierName = styled.h3`
  font-family: 'Poppins', sans-serif;
  font-size: 32px;
  font-weight: 500;
  letter-spacing: -0.02em;
  margin-bottom: 8px;
  color: inherit;
`;

const TierPrice = styled.div`
  font-family: 'Geist', monospace;
  font-size: 14px;
  letter-spacing: 0.02em;
  display: inline-block;
  border: 1px solid ${({ $active }) => $active ? 'var(--color-on-primary)' : 'var(--color-secondary)'};
  color: ${({ $active }) => $active ? 'var(--color-on-primary)' : 'var(--color-secondary)'};
  padding: 4px 8px;
  margin-bottom: 32px;
`;

const TierFeatures = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
  flex: 1;
`;

const TierFeatureItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-family: 'Geist', monospace;
  font-size: 14px;
  letter-spacing: 0.02em;
  color: ${({ $muted, $active }) => $muted ? ($active ? 'rgba(255,255,255,0.5)' : 'var(--color-secondary)') : 'inherit'};

  .material-symbols-outlined { font-size: 14px; flex-shrink: 0; margin-top: 2px; }
`;

const TierSelectLabel = styled.div`
  font-family: 'Geist', monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${({ $active }) => $active ? 'var(--color-on-primary)' : 'var(--color-secondary)'};
  border-top: 1px solid ${({ $active }) => $active ? 'var(--color-on-primary)' : 'var(--border-color)'};
  padding-top: 16px;
  margin-top: auto;
`;

const MatrixFooter = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-bottom: 1px solid var(--border-color);
  border-left: 1px solid var(--border-color);
  border-right: 1px solid var(--border-color);
  background: var(--bg-surface);

  @media (min-width: 640px) {
    grid-template-columns: 1fr 1fr 2fr;
  }
`;

const FooterCell = styled.div`
  padding: 16px;
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  &:last-child { border-right: none; }
`;

const FooterLabel = styled.span`
  font-family: 'Geist', monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-secondary);
  margin-bottom: 4px;
`;

const FooterValue = styled.span`
  font-family: 'Geist', monospace;
  font-size: 14px;
  letter-spacing: 0.02em;
  color: var(--color-primary);
  display: flex;
  align-items: center;
  gap: 8px;

  span.dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--color-primary);
    flex-shrink: 0;
  }
`;

/* ─── Data ──────────────────────────────────────────────────────────────────── */
const TIERS = [
  {
    id: 'alpha', name: 'ALPHA', price: 'FREE', cost: 0,
    features: [
      { text: 'Read-only terminal access', enabled: true },
      { text: 'Public data feeds', enabled: true },
      { text: 'Agent deployment', enabled: false },
    ],
    selectLabel: 'SELECT [ A ]',
  },
  {
    id: 'vector', name: 'VECTOR', price: '$15 / MO', cost: 15,
    features: [
      { text: 'Standard terminal access', enabled: true },
      { text: 'Private data channels', enabled: true },
      { text: '1 Concurrent Agent', enabled: true },
    ],
    selectLabel: 'SELECT [ V ]',
  },
  {
    id: 'nexus', name: 'NEXUS', price: '$49 / MO', cost: 49,
    features: [
      { text: 'Root terminal access', enabled: true },
      { text: 'Unlimited data pipelines', enabled: true },
      { text: 'Infinite Agent swarm', enabled: true },
    ],
    selectLabel: 'ACTIVE SELECTION',
  },
];

const STEPS = [
  '[ INITIALIZING CONTRACT... ]',
  '[ VERIFYING UGF BALANCE... ]',
  '[ DEDUCTING FUNDS... ]',
  '[ MINTING BADGE... ]',
];

/* ─── Component ──────────────────────────────────────────────────────────────── */
export default function Mint() {
  const [activeTier, setActiveTier] = useState('nexus');
  const [minting, setMinting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');

  const selectedTier = TIERS.find((t) => t.id === activeTier);

  const handleMint = () => {
    if (minting || success) return;
    setMinting(true);
    setProgress(0);
    setStatusMsg(STEPS[0]);
    let stepIdx = 1;

    const interval = setInterval(() => {
      const pct = stepIdx * 25;
      setProgress(pct);
      if (stepIdx < STEPS.length) {
        setStatusMsg(STEPS[stepIdx]);
      }
      stepIdx++;

      if (stepIdx > STEPS.length) {
        clearInterval(interval);
        setMinting(false);
        setSuccess(true);
        setStatusMsg('[ SUCCESS: TRANSACTION CONFIRMED ]');
        setTimeout(() => {
          setSuccess(false);
          setProgress(0);
          setStatusMsg('');
        }, 3500);
      }
    }, 800);
  };

  return (
    <PageWrap>
      <PageHeader>
        <PageTitle>Subscriptive NFT Engine</PageTitle>
        <PageSub>
          Mint dynamic subscription badges. UGF tokens are automatically deducted per epoch based on the selected tier. Upgrade or downgrade at any block height.
        </PageSub>
      </PageHeader>

      <MainGrid>
        {/* Left */}
        <LeftCol>
          <RenderBox>
            <RenderLabel>[ Render View ]</RenderLabel>
            <StatusTag $minting={minting}>
              {success ? 'MINTED' : minting ? 'MINTING' : 'IDLE'}
            </StatusTag>
            <CubeSvg width="200" height="200" viewBox="0 0 100 100" $minting={minting}>
              <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" />
              <line x1="50" y1="10" x2="50" y2="50" />
              <line x1="90" y1="30" x2="50" y2="50" />
              <line x1="10" y1="30" x2="50" y2="50" />
              <line x1="50" y1="50" x2="50" y2="90" />
              <line x1="10" y1="70" x2="50" y2="50" />
              <line x1="90" y1="70" x2="50" y2="50" />
            </CubeSvg>
          </RenderBox>

          <ActionBox>
            <ActionHeader>
              <ActionLabel>Estimated Deduction</ActionLabel>
              <ActionValue>{selectedTier.cost.toFixed(2)} UGF/MO</ActionValue>
            </ActionHeader>
            <MintBtn
              onClick={handleMint}
              disabled={minting}
              $success={success}
              className={minting ? 'loading-state' : ''}
            >
              <ProgressFill $pct={progress} />
              <span style={{ position: 'relative', zIndex: 1 }}>
                {success ? 'MINT SUCCESSFUL' : minting ? 'PROCESSING...' : 'MINT SUBSCRIPTION BADGE'}
              </span>
            </MintBtn>
            {(minting || success) && <StatusMsg>{statusMsg}</StatusMsg>}
          </ActionBox>
        </LeftCol>

        {/* Right */}
        <RightCol>
          <TierLabel>Select Access Tier</TierLabel>
          <TierGrid>
            {TIERS.map((tier) => {
              const isActive = activeTier === tier.id;
              return (
                <TierCard key={tier.id} $active={isActive} onClick={() => setActiveTier(tier.id)}>
                  <div style={{ marginBottom: 32 }}>
                    <TierName>{tier.name}</TierName>
                    <TierPrice $active={isActive}>{tier.price}</TierPrice>
                  </div>
                  <TierFeatures>
                    {tier.features.map((f) => (
                      <TierFeatureItem key={f.text} $muted={!f.enabled} $active={isActive}>
                        <span className="material-symbols-outlined">{f.enabled ? 'check' : 'close'}</span>
                        {f.text}
                      </TierFeatureItem>
                    ))}
                  </TierFeatures>
                  <TierSelectLabel $active={isActive}>{tier.selectLabel}</TierSelectLabel>
                </TierCard>
              );
            })}
          </TierGrid>

          <MatrixFooter>
            <FooterCell>
              <FooterLabel>Total Minted</FooterLabel>
              <FooterValue>12,408</FooterValue>
            </FooterCell>
            <FooterCell>
              <FooterLabel>Network Fee</FooterLabel>
              <FooterValue>0.002 ETH</FooterValue>
            </FooterCell>
            <FooterCell>
              <FooterLabel>Contract Status</FooterLabel>
              <FooterValue>
                <span className="dot" />
                ONLINE [ BLOCK 184A ]
              </FooterValue>
            </FooterCell>
          </MatrixFooter>
        </RightCol>
      </MainGrid>
    </PageWrap>
  );
}
