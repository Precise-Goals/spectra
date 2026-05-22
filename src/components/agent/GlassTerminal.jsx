import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Fingerprint, Terminal, ChevronRight } from 'lucide-react';

// --- Styled Components ---

const Card = styled(motion.div)`
  background: rgba(10, 10, 11, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-top: 1px solid rgba(176, 38, 255, 0.2);
  border-radius: 20px;
  overflow: hidden;
  backdrop-filter: blur(16px);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-family: 'Geist Mono', monospace;
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.4);
`;

const WindowDots = styled.div`
  display: flex;
  gap: 0.35rem;
  span {
    display: block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.12);
  }
`;

const ChatArea = styled.div`
  min-height: 360px;
  max-height: 500px;
  overflow-y: auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const MessageBubble = styled.div`
  max-width: 85%;
  align-self: ${({ from }) => from === 'user' ? 'flex-end' : 'flex-start'};
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  align-items: ${({ from }) => from === 'user' ? 'flex-end' : 'flex-start'};
`;

const MessageLabel = styled.span`
  font-family: 'Geist Mono', monospace;
  font-size: 0.62rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.25);
`;

const BubbleContent = styled.div`
  padding: 0.85rem 1.1rem;
  border-radius: ${({ from }) => from === 'user'
    ? '16px 16px 4px 16px'
    : '16px 16px 16px 4px'};
  background: ${({ from }) => from === 'user'
    ? 'rgba(176, 38, 255, 0.12)'
    : 'rgba(255, 255, 255, 0.04)'};
  border: 1px solid ${({ from }) => from === 'user'
    ? 'rgba(176, 38, 255, 0.25)'
    : 'rgba(255, 255, 255, 0.07)'};
  font-family: 'Geist Mono', monospace;
  font-size: 0.88rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
`;

const StatusLine = styled.div`
  font-family: 'Geist Mono', monospace;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  &::before { content: '>'; color: rgba(176, 38, 255, 0.6); }
`;

const InputArea = styled.form`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
`;

const ChevronIndicator = styled.div`
  color: rgba(176, 38, 255, 0.6);
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

const PromptInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: rgba(255, 255, 255, 0.8);
  font-family: 'Geist Mono', monospace;
  font-size: 0.9rem;
  &::placeholder { color: rgba(255, 255, 255, 0.2); }
`;

const SubmitBtn = styled(motion.button)`
  font-family: 'Geist Mono', monospace;
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(176, 38, 255, 0.7);
  background: transparent;
  border: 1px solid rgba(176, 38, 255, 0.2);
  border-radius: 8px;
  padding: 0.45rem 0.9rem;
  cursor: pointer;
  transition: all 0.25s ease;
  &:hover {
    background: rgba(176, 38, 255, 0.1);
    color: rgba(176, 38, 255, 1);
    border-color: rgba(176, 38, 255, 0.4);
  }
  &:disabled { opacity: 0.3; cursor: not-allowed; }
`;

// --- Pulse Wave Loader ---
const WaveLoader = styled(motion.div)`
  display: flex;
  gap: 0.4rem;
  align-items: center;
  padding: 0.6rem 0;
`;

const WaveDot = styled(motion.div)`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(176, 38, 255, 0.7);
`;

const dotVariants = {
  animate: (i) => ({
    scaleY: [1, 2.5, 1],
    opacity: [0.4, 1, 0.4],
    transition: { duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' },
  }),
};

const PulseWave = () => (
  <WaveLoader>
    {[0, 1, 2, 3, 4].map((i) => (
      <WaveDot key={i} custom={i} variants={dotVariants} animate="animate" />
    ))}
  </WaveLoader>
);

// --- Props types for clarity ---
/**
 * @param {object} props
 * @param {string} props.inputValue
 * @param {function} props.onInputChange
 * @param {function} props.onSubmit
 * @param {boolean} props.isLoading
 * @param {Array<{from: 'user'|'agent', content: string}>} props.messages
 */
export default function GlassTerminal({ inputValue, onInputChange, onSubmit, isLoading, messages }) {
  return (
    <Card
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 100 }}
    >
      <Header>
        <HeaderLeft>
          <Terminal size={14} />
          AGENTIC_WALLET_OS // ACTIVE_MODE
        </HeaderLeft>
        <WindowDots>
          <span /><span /><span />
        </WindowDots>
      </Header>

      <ChatArea id="chat-container">
        {messages.map((msg, i) => (
          <MessageBubble key={i} from={msg.from}>
            <MessageLabel>{msg.from === 'user' ? 'USER_INPUT' : 'SYSTEM_AGENT'}</MessageLabel>
            <BubbleContent from={msg.from}>
              {msg.from === 'agent' && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <StatusLine>Parsing intent...</StatusLine>
                  <StatusLine>Constructing transaction graph...</StatusLine>
                  <StatusLine>Status: <span style={{ color: 'rgba(176,38,255,0.9)', marginLeft: '0.3rem' }}>[ READY ]</span></StatusLine>
                </div>
              )}
              {msg.content}
            </BubbleContent>
          </MessageBubble>
        ))}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ alignSelf: 'flex-start', paddingLeft: '0.5rem' }}
            >
              <PulseWave />
            </motion.div>
          )}
        </AnimatePresence>
      </ChatArea>

      <InputArea onSubmit={onSubmit}>
        <ChevronIndicator><ChevronRight size={16} /></ChevronIndicator>
        <PromptInput
          type="text"
          placeholder="What onchain action can I route for you?"
          value={inputValue}
          onChange={onInputChange}
          disabled={isLoading}
          autoComplete="off"
        />
        <SubmitBtn
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          whileTap={{ scale: 0.95 }}
        >
          [ Submit ]
        </SubmitBtn>
      </InputArea>
    </Card>
  );
}
