import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, AlertCircle, Fingerprint } from 'lucide-react';
import { tryParseDefiIntent } from '../../api/sarvamAgent.js';

// --- Styled Components ---

const Container = styled.div`
  width: 100%;
  min-height: 80vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  position: relative;
  z-index: 10;
`;

const GlassPanel = styled(motion.div)`
  width: 100%;
  max-width: 560px;
  background: rgba(10, 10, 11, 0.5);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1);
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.95rem;
  margin-bottom: 2rem;
`;

const InputWrapper = styled.form`
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const StyledInput = styled.input`
  width: 100%;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.25rem 3.5rem 1.25rem 1.25rem;
  font-size: 1rem;
  color: #ffffff;
  outline: none;
  transition: all 0.3s ease;

  &:focus {
    border-color: rgba(176, 38, 255, 0.5);
    background: rgba(255, 255, 255, 0.05);
    box-shadow: 0 0 0 4px rgba(176, 38, 255, 0.1);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`;

const SubmitButton = styled(motion.button)`
  position: absolute;
  right: 0.75rem;
  background: transparent;
  border: none;
  color: #B026FF;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem;
  border-radius: 50%;
  cursor: pointer;
  outline: none;

  &:disabled {
    color: rgba(255, 255, 255, 0.2);
    cursor: not-allowed;
  }
`;

// --- Fading Geometric Waves Animation ---
const WavesContainer = styled(motion.div)`
  position: relative;
  width: 100%;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 1.5rem 0;
`;

const WaveRing = styled(motion.div)`
  position: absolute;
  border: 2px solid rgba(176, 38, 255, 0.8);
  border-radius: 50%;
  box-shadow: 0 0 20px rgba(176, 38, 255, 0.2);
`;

const GeometricWaves = () => (
  <WavesContainer
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    {[0, 1, 2].map((i) => (
      <WaveRing
        key={i}
        style={{ width: 40, height: 40 }}
        animate={{ 
          scale: [1, 2.5], 
          opacity: [0.8, 0] 
        }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity, 
          delay: i * 0.5, 
          ease: "easeOut" 
        }}
      />
    ))}
  </WavesContainer>
);

// --- Confirmation Card ---

const ConfirmationCard = styled(motion.div)`
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(176, 38, 255, 0.3);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: hidden;
  position: relative;
`;

const CardGlow = styled.div`
  position: absolute;
  top: -50px;
  right: -50px;
  width: 100px;
  height: 100px;
  background: rgba(176, 38, 255, 0.3);
  filter: blur(40px);
  border-radius: 50%;
  pointer-events: none;
`;

const IntentRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  
  &:last-of-type {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const Label = styled.span`
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
`;

const Value = styled.span`
  color: #ffffff;
  font-weight: 600;
  font-size: 1.1rem;
  text-transform: uppercase;
`;

const SignButton = styled(motion.button)`
  margin-top: 1rem;
  width: 100%;
  padding: 1rem;
  border-radius: 12px;
  background: linear-gradient(90deg, #B026FF, #7B26FF);
  color: white;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(176, 38, 255, 0.3);
  
  &:hover {
    box-shadow: 0 6px 20px rgba(176, 38, 255, 0.5);
  }
`;

const ErrorMsg = styled(motion.div)`
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 12px;
  background: rgba(255, 59, 48, 0.1);
  border: 1px solid rgba(255, 59, 48, 0.3);
  color: #ff3b30;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
`;

// --- Main Component ---

export default function AgentTerminal() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [intent, setIntent] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setIntent(null);

    // Call the Sarvam AI utility
    const result = await tryParseDefiIntent(prompt);

    if (result) {
      if (result.action === 'unknown') {
        setError("Could not parse a valid DeFi intent. Please be more specific (e.g. 'Swap 10 USDC for ETH').");
      } else {
        setIntent(result);
      }
    } else {
      setError("Failed to communicate with the Agent. Please check your API key or connection.");
    }
    
    setIsLoading(false);
  };

  return (
    <Container>
      <GlassPanel
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 120 }}
      >
        <Title>AI Wallet Agent</Title>
        <Subtitle>Type your intent and let the agent construct the transaction.</Subtitle>

        <InputWrapper onSubmit={handleSubmit}>
          <StyledInput
            type="text"
            placeholder="e.g. Swap 0.5 ETH for USDC"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
            autoComplete="off"
          />
          <SubmitButton 
            type="submit" 
            disabled={!prompt.trim() || isLoading}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Send size={20} />
          </SubmitButton>
        </InputWrapper>

        <AnimatePresence mode="wait">
          {isLoading && <GeometricWaves key="waves" />}
          
          {error && (
            <ErrorMsg 
              key="error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <AlertCircle size={18} />
              {error}
            </ErrorMsg>
          )}

          {intent && !isLoading && (
            <ConfirmationCard
              key="intent"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
            >
              <CardGlow />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <CheckCircle2 size={20} color="#B026FF" />
                <span style={{ color: '#fff', fontWeight: 500 }}>Intent Parsed Successfully</span>
              </div>
              
              <IntentRow>
                <Label>Action</Label>
                <Value>{intent.action}</Value>
              </IntentRow>
              <IntentRow>
                <Label>Amount</Label>
                <Value>{intent.amount}</Value>
              </IntentRow>
              <IntentRow>
                <Label>Token</Label>
                <Value>{intent.token}</Value>
              </IntentRow>

              <SignButton
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => console.log('Initiating signature for:', intent)}
              >
                <Fingerprint size={18} />
                Sign Transaction (EIP-712)
              </SignButton>
            </ConfirmationCard>
          )}
        </AnimatePresence>
      </GlassPanel>
    </Container>
  );
}
