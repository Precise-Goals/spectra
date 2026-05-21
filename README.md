# 📄 Product Requirements Document (PRD)

**Project Name:** Spectra
**System:** Unified Web3 Exchange, Autonomous Agentic Wallet & Subscriptive NFT Engine
**Architecture Stage:** Production Blueprint
**Target Network:** Base Sepolia Testnet
**Core Stack:** Bun, React (JS), Vite, Universal Gas Framework (UGF), Axios

---

## 1. Executive Summary & Product Pivot

We are completely deprecating the legacy Falitric code and pivoting fully to **Spectra**—a unified, high-fidelity platform that integrates a decentralized asset exchange, an autonomous agentic wallet, and an exclusive subscription-gated NFT minting protocol.

By leveraging the **Universal Gas Framework (UGF)**, Spectra completely abstracts native gas fees (ETH). Users settle transaction costs, trade fees, and automated recurring software-as-a-service (SaaS) subscriptions using solely **Mock USD**. The entire ecosystem is wrapped in a high-contrast monochromatic design system driven by the geometric clarity of the Poppins typeface.

---

## 2. Product Tiering & SaaS Matrix

The system uses an automated web3-native subscription engine. The platform holds a smart-contract allowance to auto-deduct monthly subscription fees in Mock USD directly from the user's connected wallet at the start of each billing cycle.

### 📊 Subscription Matrix & Perks

| Plan Tier | Daily Transaction Limit | Monthly Fee (Mock USD) | Exclusive NFT Minting Access | Target Capabilities |
| --- | --- | --- | --- | --- |
| **Alpha Tier** | 20 transactions / day | Free / Trial | ❌ No Access | Basic asset swaps, balance tracking, simple single-route exchange actions. |
| **Vector Tier** | 60 transactions / day | $15.00 USD / mo | **Tier-exclusive Badge** (Mintable once per cycle) | Advanced multi-routing swaps, priority conversational agent routing. |
| **Nexus Tier** | 100 transactions / day | $49.00 USD / mo | 🌟 **Dynamic Premium NFT** (Evolutionary metadata perks) | Full high-frequency execution, micro-yield automations, premium platform perks. |

---

## 3. Core Feature Specifications

### 3.1 The Integrated Spectra Exchange

* **Mechanism:** A sleek, minimal exchange interface that connects directly to Base Sepolia liquidity pools.
* **Gasless Architecture:** Swaps are routed through the UGF SDK. The user inputs a trade (e.g., Swap Mock USD for Wrapped Tokens), views a clean quote, and executes the trade using Mock USD to settle the execution layer fees.



### 3.2 The Autonomous Agentic Wallet

* **Bring Your Own Wallet (BYOW):** Users connect standard browser wallets (MetaMask, Coinbase Wallet).
* **Intent Processing:** The UI features an interactive terminal window where users type natural language commands (*"Swap 50 Mock USD into the highest volume index"*).
* **Execution Flow:** The AI converts the prompt into raw transaction parameters. Instead of demanding native gas, the user authorizes the trade with an offchain **EIP-712 Signature**. The UGF execution layer processes the request onchain, deducting the fee in Mock USD.



### 3.3 Subscriptive NFT Minting Engine

* **Gatekeeping:** The SpectraNFT.sol contract exposes a mintSubscribedNFT function that explicitly checks the user's active billing tier inside SpectraSaaS.sol.
* **Utility Perks:**
* Vector Tier users can mint an immutable subscriber verification badge.
* Nexus Tier users receive a dynamic NFT whose metadata changes based on the user's monthly platform transaction volume.
* All gas costs for these mints are entirely handled via UGF (paid in Mock USD), making the minting action feel invisible and seamless.





---

## 4. Legal & Regulatory Framework (EU AI Act Compliance)

To safeguard the platform against compliance challenges within European jurisdictions, the software architecture enforces four hard restrictions:

* **Article 50 Transparency Checklist:** The UI must clearly label all conversational interfaces as "Automated AI Agentic Assistants."
* **Human-in-the-Loop Constraint:** The AI Agent is sandboxed. It can construct transaction payloads and find optimal trade routes via Axios, but it *cannot* sign transactions autonomously. The human user must provide a physical cryptographic signature (EIP-712) for every action.
* **Zero Social Automation:** The agent is strictly locked out of social platforms. It cannot scrape external social graphs or post automated updates to networks. It handles onchain transactional parameters exclusively.

---

## 5. UI/UX Design System & Typography

* **Typography:** The universal font family is **Poppins**.
* *Headers & Interaction Elements:* Poppins (SemiBold/Medium) to present clean, highly legible structural forms.
* *Transaction Counters & Hashes:* Poppins (Light) formatted with strict tabular tracking to keep shifting numbers aligned.


* **Monochromatic Design Shifts:** The application operates on an absolute black (#000000) and white (#FFFFFF) palette.
* *The Shift:* When the app is in an idle state or the user is manually executing an exchange swap, the layout uses a light theme (stark white background, sharp black borders).
* *The Inversion:* The moment the user engages the Autonomous AI Agent or initiates a UGF transaction sequence, the UI smoothly shifts to dark mode (pure black background, stark white typography), providing immediate, high-fidelity visual feedback that an automated onchain process is running.


* **Animations:** Interactive state transitions are handled via framer-motion, utilizing crisp layouts and geometric loading blocks rather than colorful spinners.

---

## 6. Granular Code-Splitting & Technical Domain Allocation

The monorepo separates smart contract development from frontend execution. Here is the architectural layout and team distribution:

```text
spectra-core/
├── /contracts                  # Smart Contract Workspace (Solidity)
│   ├── src/
│   │   ├── SpectraSaaS.sol     # Tracks subscription tiers (20/60/100) & auto-deductions
│   │   ├── SpectraExchange.sol # Custom router abstractions for exchange logic
│   │   └── SpectraNFT.sol      # Gated NFT minting logic for Vector/Nexus subscribers
│   └── hardhat.config.js       # JS-based compiler configuration
| # Bun + Vite Client Application
├── package.json            # Fast package dependency mapping via Bun
└── src/
    ├── agent/              # AI Core (Axios setup, prompt parsers, EIP-712 engines)
    ├── components/         # Pure UI elements (Poppins configuration, monochromatic styles)
    └── context/            # UGF State Provider mapping

```

### Team Allocations

* **Smart Contracts & UGF Router (/contracts):** *Utkarsh Vidwat & Gaurav Chaudhari*
* **AI Engine, Intent Mapping & Axios Pipelines (/frontend/src/agent):** *Dhiraj Takale & Satyam Singh*
* **Monochromatic UI Components & Alternative View Shifts (/frontend/src/components):** *Prathamesh Kolhe*

---

## 7. Development & Debugging Workflow

### 7.1 Building with Gemini CLI

The engineering team will leverage the **Gemini CLI** to generate clean scaffolding:

* To generate the modular exchange interface:
```bash
gemini generate component ExchangeRouter --style=monochromatic-poppins


```
*   The CLI will also be used to automatically spit out the boilerplate Axios network handlers that forward prompt text to our backend parsing services.

### 7.2 Debugging with Antigravity Claude
**Antigravity Claude** will handle code diagnostics and execution state debugging:
*   **UGF Failure Audits:** If a UGF transaction fails during the quote estimation or settlement phases (e.g., due to an expired Mock USD token allowance), the raw stack traces will be evaluated through Claude to fix the state handler[cite: 1].
*   **Subscription Enforcement Loops:** Claude will verify the async code constraints ensuring that a user at 20 transactions per day is securely prevented from sending a 21st call without an unhandled runtime error.

---
