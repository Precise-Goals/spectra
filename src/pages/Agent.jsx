import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';
import { tryParseDefiIntent } from '../api/sarvamAgent';

/* ─── Styled ─────────────────────────────────────────────────────────────────── */

const PageWrap = styled.main`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 16px 16px;
  position: relative;
  overflow: hidden;
  min-height: 100vh;

  @media (min-width: 768px) {
    padding: 0;
  }
`;

const DotBg = styled.div`
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background-image: radial-gradient(circle at 50% 50%, rgba(0,0,0,0.05) 1px, transparent 1px);
  background-size: 24px 24px;

  [data-theme='dark'] & {
    background-image: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.04) 1px, transparent 1px);
  }
`;

const Terminal = styled.div`
  width: 100%;
  max-width: 896px;
  height: 819px;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
  background: var(--bg);
  position: relative;
  z-index: 10;

  @media (max-width: 768px) {
    height: auto;
    min-height: 80vh;
  }
`;

const TermHeader = styled.div`
  height: 48px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: var(--bg);
  flex-shrink: 0;
`;

const TermTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  font-family: 'Geist', monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-primary);

  .material-symbols-outlined { font-size: 14px; }
`;

const WindowDots = styled.div`
  display: flex;
  gap: 8px;

  span {
    display: block;
    width: 12px;
    height: 12px;
    border: 1px solid var(--border-color);
    border-radius: 50%;
  }
`;

const ChatArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const MessageGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: ${({ $user }) => $user ? 'flex-end' : 'flex-start'};
  max-width: 90%;
  align-self: ${({ $user }) => $user ? 'flex-end' : 'flex-start'};
`;

const MessageLabel = styled.span`
  font-family: 'Geist', monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-primary);
  opacity: 0.5;
`;

const MessageBubble = styled.div`
  border: 1px solid var(--border-color);
  padding: 12px 16px;
  font-family: 'Geist', monospace;
  font-size: 14px;
  letter-spacing: 0.02em;
  color: var(--color-primary);
  line-height: 1.5;
  background: var(--bg);
`;

const AgentResponseBox = styled.div`
  border: 1px solid var(--border-color);
  padding: 24px;
  font-family: 'Geist', monospace;
  font-size: 14px;
  letter-spacing: 0.02em;
  color: var(--color-primary);
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: var(--bg);
`;

const StatusLine = styled.p`
  &::before { content: '> '; }
`;

const StatusReady = styled.span`
  background: var(--color-primary);
  color: var(--color-on-primary);
  padding: 0 4px;
`;

const JsonBlock = styled.div`
  padding-left: 16px;
  border-left: 1px solid var(--border-color);
`;

const JsonPre = styled.pre`
  font-family: 'Geist', monospace;
  font-size: 13px;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--color-primary);
  line-height: 1.5;
`;

const SignButton = styled.button`
  align-self: flex-start;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: 1px solid var(--border-color);
  background: var(--bg);
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

  .material-symbols-outlined { font-size: 14px; }
`;

const InputArea = styled.form`
  height: 80px;
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 24px;
  background: var(--bg);
  flex-shrink: 0;
`;

const ChevronIcon = styled.span`
  .material-symbols-outlined {
    font-size: 20px;
    color: var(--color-primary);
  }
`;

const TextInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-family: 'Geist', monospace;
  font-size: 18px;
  letter-spacing: 0em;
  color: var(--color-primary);

  &::placeholder { color: var(--color-secondary); }
`;

const SubmitBtn = styled.button`
  font-family: 'Geist', monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-primary);
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.5;

  &:hover { opacity: 1; }
  &:disabled { opacity: 0.2; cursor: not-allowed; }
`;

/* loading dots */
const LoadingDots = styled.div`
  display: flex;
  gap: 6px;
  padding: 8px 0;

  span {
    display: block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--color-primary);
    animation: blink 1.2s ease-in-out infinite;

    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }

  @keyframes blink { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }
`;

/* ─── Component ──────────────────────────────────────────────────────────────── */

const INITIAL_MESSAGES = [
  {
    id: 0,
    role: 'agent',
    content: null,
    json: null,
    statusLines: [
      '> Parsing intent...',
      '> Constructing multi-step cross-chain transaction...',
    ],
    readyLabel: '[ READY ]',
    jsonData: `{
  "intent_id": "0x8f2a...91b4",
  "trigger": {
    "type": "GAS_CONDITION",
    "network": "ethereum",
    "threshold_gwei": "< 15"
  },
  "execution_graph": [
    {
      "step": 1,
      "action": "BRIDGE",
      "asset": "USDC",
      "amount": "500",
      "from": "ethereum",
      "to": "arbitrum"
    },
    {
      "step": 2,
      "action": "SWAP",
      "dex": "uniswap_v3",
      "pair": "USDC/ETH"
    },
    {
      "step": 3,
      "action": "STAKE",
      "protocol": "lido",
      "asset": "ETH"
    }
  ],
  "estimated_fees": "~$4.20"
}`,
    showSign: true,
    userMsg: 'Route 500 USDC to Arbitrum, then execute a swap to ETH and stake it in Lido. Wait for gas to drop below 15 gwei.',
  },
];

export default function Agent() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg = { id: Date.now(), role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const result = await tryParseDefiIntent(text);
    setIsLoading(false);

    if (result && result.action !== 'unknown') {
      const jsonStr = JSON.stringify({
        intent_id: '0x' + Math.random().toString(16).slice(2, 10),
        action: result.action,
        amount: result.amount,
        token: result.token,
        estimated_fees: '~$0.00 (via UGF)',
      }, null, 2);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'agent',
          statusLines: ['> Parsing intent...', '> Constructing transaction graph...'],
          readyLabel: '[ READY ]',
          jsonData: jsonStr,
          showSign: true,
        },
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'agent',
          statusLines: ['> Parsing intent...', '> No action found.'],
          readyLabel: '[ CLARIFICATION REQUIRED ]',
          jsonData: null,
          showSign: false,
        },
      ]);
    }
  };

  return (
    <PageWrap>
      <DotBg />
      <Terminal>
        <TermHeader>
          <TermTitle>
            <span className="material-symbols-outlined">terminal</span>
            AGENTIC_WALLET_OS // ACTIVE_MODE
          </TermTitle>
          <WindowDots>
            <span /><span /><span />
          </WindowDots>
        </TermHeader>

        <ChatArea ref={chatRef}>
          {messages.map((msg) => {
            if (msg.role === 'user' || msg.userMsg) {
              return (
                <React.Fragment key={msg.id}>
                  {msg.userMsg && (
                    <MessageGroup $user>
                      <MessageLabel>USER_INPUT</MessageLabel>
                      <MessageBubble>{msg.userMsg}</MessageBubble>
                    </MessageGroup>
                  )}
                  {msg.role === 'user' && (
                    <MessageGroup $user>
                      <MessageLabel>USER_INPUT</MessageLabel>
                      <MessageBubble>{msg.content}</MessageBubble>
                    </MessageGroup>
                  )}
                  {/* Show corresponding agent block for initial message */}
                  {msg.role === 'agent' || msg.statusLines ? (
                    <MessageGroup key={`agent-${msg.id}`}>
                      <MessageLabel>SYSTEM_AGENT</MessageLabel>
                      <AgentResponseBox>
                        <div>
                          {(msg.statusLines || []).map((line, i) => (
                            <StatusLine key={i}>{line.replace('> ', '')}</StatusLine>
                          ))}
                          <p>
                            &gt; Status:{' '}
                            <StatusReady>{msg.readyLabel || '[ READY ]'}</StatusReady>
                          </p>
                        </div>
                        {msg.jsonData && (
                          <JsonBlock>
                            <JsonPre>{msg.jsonData}</JsonPre>
                          </JsonBlock>
                        )}
                        {msg.showSign && (
                          <SignButton>
                            <span className="material-symbols-outlined">signature</span>
                            Sign &amp; Execute (EIP-712)
                          </SignButton>
                        )}
                      </AgentResponseBox>
                    </MessageGroup>
                  ) : null}
                </React.Fragment>
              );
            }

            if (msg.role === 'agent') {
              return (
                <MessageGroup key={msg.id}>
                  <MessageLabel>SYSTEM_AGENT</MessageLabel>
                  <AgentResponseBox>
                    <div>
                      {(msg.statusLines || []).map((line, i) => (
                        <StatusLine key={i}>{line.replace('> ', '')}</StatusLine>
                      ))}
                      <p>&gt; Status: <StatusReady>{msg.readyLabel}</StatusReady></p>
                    </div>
                    {msg.jsonData && (
                      <JsonBlock><JsonPre>{msg.jsonData}</JsonPre></JsonBlock>
                    )}
                    {msg.showSign && (
                      <SignButton>
                        <span className="material-symbols-outlined">signature</span>
                        Sign &amp; Execute (EIP-712)
                      </SignButton>
                    )}
                  </AgentResponseBox>
                </MessageGroup>
              );
            }

            return null;
          })}

          {isLoading && (
            <MessageGroup>
              <MessageLabel>SYSTEM_AGENT</MessageLabel>
              <LoadingDots><span /><span /><span /></LoadingDots>
            </MessageGroup>
          )}
        </ChatArea>

        <InputArea onSubmit={handleSubmit}>
          <ChevronIcon>
            <span className="material-symbols-outlined">chevron_right</span>
          </ChevronIcon>
          <TextInput
            type="text"
            placeholder="What onchain action can I route for you?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <SubmitBtn type="submit" disabled={!input.trim() || isLoading}>
            [ SUBMIT ]
          </SubmitBtn>
        </InputArea>
      </Terminal>
    </PageWrap>
  );
}
