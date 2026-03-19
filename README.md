# 🌐 Wrap-Up Evolved: Study Differently
**A Decentralized Web3 AI Research & News Curation Platform — Built on Polkadot**

[![Live Demo](https://img.shields.io/badge/Live%20App-wrap--up--polkadot.vercel.app-10b981?style=for-the-badge&logo=vercel)](https://wrap-up-polkadot.vercel.app/)
[![Demo Video](https://img.shields.io/badge/Watch-Demo%20Video-FF0000?style=for-the-badge&logo=youtube)](https://youtu.be/gcb1c2ZSsmw)
[![Polkadot](https://img.shields.io/badge/Chain-Polkadot%20Hub%20Testnet-E6007A?style=for-the-badge&logo=polkadot)](https://polkadot.network)

---

## 📖 Full Project Description

### What is Wrap-Up Evolved?

Wrap-Up Evolved is a fully-fledged decentralized social platform engineered for the modern Web3 researcher. We position it as a tool to **"Study Differently."** Instead of drowning in noisy Twitter feeds, scattered Discord servers, or financially motivated shilling, Wrap-Up delivers a **gamified, decentralized ecosystem** where high-quality articles and AI-generated research reports are curated, discussed, and permanently recorded on-chain via **Polkadot Hub Testnet**.

The platform merges the speed and intelligence of AI with the trust and transparency of blockchain, creating a new category of tool: a **verifiable, community-driven knowledge layer for Web3.**

---

### 🚨 The Problem

The Web3 information landscape is broken in three critical ways:

| Problem | Impact |
|---|---|
| **Information Overload** | Hundreds of articles, threads, and posts published daily with no quality filter |
| **Financial Bias & Shilling** | Content is routinely published to pump tokens, mislead investors, or spread FUD |
| **No Verifiable Source of Truth** | There is no on-chain, cryptographically backed record of what content is accurate |

Wrap-Up Evolved directly attacks all three by combining **AI-powered research synthesis**, **community-driven curation**, and **immutable on-chain storage** on the Polkadot ecosystem.

---

### ✅ The Solution

Wrap-Up Evolved is the platform where:
- **AI writes research** so you don't have to chase sources
- **Communities curate** and rank what actually matters
- **The blockchain records** what has been verified, forever
- **Readers earn** for contributing high-quality knowledge

---

## 🌟 Core Features - In Full Detail

### 1. 🤖 AI Research Report Generator

Users enter any research topic or question, and Wrap-Up's backend AI engine autonomously:

- **Scours the live web** for the most relevant and recent sources
- **Synthesizes a structured, high-quality research report** - complete with key findings, summaries, and source citations
- **Uploads the compiled report to IPFS** via Pinata, producing a permanent, tamper-proof content hash
- **Commits the IPFS hash on-chain** to the WrapUp smart contract on Polkadot Hub Testnet, creating an immutable publication record

The result is a research report that is not just informative, it is **verifiably published on a decentralized, censorship-resistant network.** Every report gets its own on-chain fingerprint that anyone can independently verify.

> **Use Case:** A user wants to understand the current state of Polkadot's parachain ecosystem. Instead of spending hours reading, they submit the prompt to Wrap-Up and receive a synthesized, sourced report in seconds, permanently stored and community-ranked.

---

### 2. 📰 Article Curation & Leaderboard

Any user can submit external article links to the platform. Wrap-Up's curation engine then:

- **Fetches and extracts the full article content** for clean, distraction-free in-app reading (no more paywalls or ad-heavy pages)
- **Displays the article** in a beautiful reader view with full formatting intact
- **Records the submission on-chain**, anchoring it to the submitter's wallet address and timestamp
- **Tracks community engagement** - upvotes, comments, and saves - aggregated into a **live curation leaderboard**

#### 🏆 The WUP Token Reward System
Users who consistently submit high-quality articles that rise to the top of the leaderboard **earn WUP tokens** - the platform's native utility token. This creates a self-reinforcing incentive loop:

```
Submit quality content → Community upvotes → Climb leaderboard → Earn WUP rewards
```

This token model aligns community incentives with content quality, making spam and low-effort submissions economically irrational.

---

### 3. ⚖️ Article Comparator Tool

One of Wrap-Up's most powerful productivity features is the built-in **Article Comparator** - a side-by-side reading and analysis tool that allows users to:

- **Load any two articles or AI research reports** into a split-screen view simultaneously
- **Highlight and compare** key claims, data points, and conclusions across sources
- **Identify contradictions** between sources on the same topic - critical for spotting biased or misleading content
- **Copy, annotate, and export** comparison sessions for further study or sharing

> **Use Case:** A researcher wants to compare a bullish vs. bearish analysis on a DeFi protocol. They load both into the comparator and immediately see where the arguments diverge, without switching tabs or losing context.

---

### 4. 💬 Decentralized Social Hub (Reddit-Style Discussion Threads)

Every article and research report on Wrap-Up is a living social object. Beneath each piece of content, users can:

- **Post threaded comments** - full Reddit-style nested discussions that allow deep, contextual debate
- **Upvote and downvote** both comments and articles, with scores reflecting genuine community sentiment
- **Tag comments** as questions, corrections, or endorsements for better discussion navigation
- **View the on-chain record** of all interactions, ensuring that engagement data cannot be silently deleted or manipulated by any central authority

All social interactions are **permanently backed by the blockchain**, meaning discussion history is owned by the community, not by any company or server.

---

### 5. 🪙 WUP Token Economy

WUP is the native ERC-20 utility token that powers all economic activity on the platform:

| Action | Token Flow |
|---|---|
| Submit a top-ranked article | **Earn WUP** |
| Generate a widely-read AI report | **Earn WUP** |
| Claim rewards from the WUPClaimer contract | **Receive WUP** |
| Future: Stake WUP to boost content visibility | **Spend WUP** |

The WUPClaimer contract manages reward distribution in a transparent, auditable manner, users can verify every token emission directly on-chain.

---

### 6. 🔒 On-Chain Content Provenance

Every piece of content on Wrap-Up, whether AI-generated or user-curated, has a **cryptographic proof of existence** stored on the Polkadot Hub Testnet. This means:

- **Who published it** (wallet address)
- **When it was published** (block timestamp)
- **What the content is** (IPFS hash - immutable reference to the full text)

This is the foundation of **verifiable knowledge on Web3** - content that cannot be retroactively altered, censored, or disappeared.

---

## 🏗️ Architecture & Technical Workflow

Wrap-Up bridges Web2 AI capabilities with Web3 infrastructure through a clean, modular pipeline:

```
User Action
    │
    ▼
React Frontend (Wagmi + Vite)
    │  User submits article URL or research prompt
    ▼
Node.js / Express Backend
    │  AI synthesizes report or extracts article content
    ▼
IPFS (via Pinata)
    │  Full content uploaded → IPFS Hash returned
    ▼
Polkadot Hub Testnet (Smart Contracts via Wagmi)
    │  IPFS Hash + metadata committed on-chain
    ▼
Frontend Polling (useReadContract)
    │  UI reads on-chain data in real time
    ▼
User sees verified, on-chain content card
```

### Data Flow for AI Research Reports

```
1. User inputs research prompt
2. Backend AI agent queries live web sources
3. AI synthesizes structured report with citations
4. Report uploaded to IPFS → hash returned
5. Hash submitted to WrapUp.sol on Polkadot Hub Testnet
6. Frontend displays report with on-chain publication badge
7. Community upvotes, comments, and ranks the report
8. High-quality report submitter earns WUP tokens
```

---

## 🛠️ Full Tech Stack

| Layer | Technology |
|---|---|
| **Smart Contracts** | Solidity, Foundry |
| **Blockchain** | Polkadot Hub Testnet |
| **Frontend** | React, Vite, TailwindCSS |
| **State Management** | Zustand |
| **Blockchain Interaction** | Wagmi, Viem |
| **Decentralized Storage** | IPFS via Pinata |
| **Backend** | Node.js, Express |
| **AI Engine** | Web-scraping + LLM synthesis pipeline |
| **Wallet Support** | MetaMask, WalletConnect (EVM-compatible) |

---

## 🔴 Polkadot Integration

Wrap-Up Evolved is deployed on the **Polkadot Hub Testnet**, leveraging Polkadot's EVM-compatible infrastructure to deliver:

- **Fast, low-cost transactions** - ideal for high-frequency social interactions like upvotes and comment submissions
- **EVM Compatibility** - full support for Solidity smart contracts, enabling seamless developer experience with Foundry and Wagmi
- **Ecosystem alignment** - built within the broader Polkadot ecosystem, positioning Wrap-Up to expand across parachains as the platform scales

### ✅ Deployed Contracts - Polkadot Hub Testnet

| Contract | Address |
|---|---|
| **WrapUp Core** | `0xcd04001daE47548e3e28E847cF2669752acDC57A` |
| **WUP Token** | `0x067A590CBc7610d5Ef00A9d5cE2d12889C0Ae31b` |
| **WUP Claimer** | `0x012b50D023E4157D10f5562a8dD01D55e145B0a2` |

### Smart Contract Architecture

#### `WrapUp.sol` - Core Contract
- Stores IPFS hashes for all curated articles and AI research reports
- Tracks upvote counts and community engagement scores per content item
- Maps content to submitter wallet addresses for reward attribution
- Emits events consumed by the frontend for real-time UI updates

#### `WUPToken.sol` - ERC-20 Utility Token
- Standard ERC-20 implementation with minting controlled by the WUPClaimer contract
- Tracks balances across all platform participants
- Enables future governance and staking features

#### `WUPClaimer.sol` - Reward Distribution
- Manages the calculation and distribution of WUP token rewards to top content contributors
- Implements leaderboard-based claim logic, only addresses ranked above a threshold are eligible
- Fully transparent: every reward emission is verifiable on-chain

---

## 🗂️ Repository Structure

```
wrap-up-evolved/
├── contracts/
│   ├── src/
│   │   ├── WrapUp.sol          # Core content registry & upvote logic
│   │   ├── WUPToken.sol        # ERC-20 utility token
│   │   └── WUPClaimer.sol      # Reward distribution contract
│   └── foundry.toml
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ArticleCard.jsx      # Displays on-chain article data
│   │   │   ├── ResearchReport.jsx   # AI report viewer
│   │   │   ├── Comparator.jsx       # Side-by-side article tool
│   │   │   └── DiscussionThread.jsx # Reddit-style comments
│   │   ├── pages/
│   │   └── store/                   # Zustand state management
│   ├── vite.config.js
│   └── tailwind.config.js
├── backend/
│   ├── routes/
│   │   ├── research.js         # AI report generation endpoint
│   │   └── articles.js         # Article fetch & extraction endpoint
│   └── server.js
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Foundry (for contract compilation & deployment)
- A Web3 wallet (MetaMask recommended) connected to **Polkadot Hub Testnet**
- Pinata API key (for IPFS uploads)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/wrap-up-evolved.git
cd wrap-up-evolved
```

### 2. Install Frontend Dependencies
```bash
cd frontend
npm install
```

### 3. Configure Environment Variables
```bash
# frontend/.env
VITE_WRAPUP_CONTRACT=0xcd04001daE47548e3e28E847cF2669752acDC57A
VITE_WUP_TOKEN=0x067A590CBc7610d5Ef00A9d5cE2d12889C0Ae31b
VITE_WUP_CLAIMER=0x012b50D023E4157D10f5562a8dD01D55e145B0a2
VITE_CHAIN_ID=<Polkadot Hub Testnet Chain ID>

# backend/.env
PINATA_API_KEY=your_pinata_key
PINATA_SECRET=your_pinata_secret
AI_API_KEY=your_ai_key
```

### 4. Run the Backend
```bash
cd backend
npm install
npm run dev
```

### 5. Run the Frontend
```bash
cd frontend
npm run dev
```

### 6. Compile & Deploy Contracts (Optional)
```bash
cd contracts
forge build
forge script script/Deploy.s.sol --rpc-url <polkadot_hub_testnet_rpc> --broadcast
```

---

## 🎯 What Makes This a Winning Project

| Dimension | Wrap-Up Evolved |
|---|---|
| **Real Problem** | Web3 information overload and misinformation are unsolved, billion-dollar problems |
| **Full-Stack Completeness** | Working frontend, backend, smart contracts, IPFS storage - all integrated end-to-end |
| **Genuine Decentralization** | Content provenance and social data backed by the blockchain, not a database |
| **Token Economic Design** | Incentives aligned so good content is financially rational to produce |
| **Polkadot Native** | EVM-compatible contracts deployed and verified on Polkadot Hub Testnet |
| **UX-First** | Research tools, comparator, and reader view built for real daily utility |
| **Live & Accessible** | Fully deployed and demo-able at wrap-up-evolved.vercel.app |

---

## 🔮 Roadmap

- [ ] **Governance Module** - WUP holders vote on curation policies and platform parameters
- [ ] **Parachain Expansion** - Deploy across additional Polkadot parachains for cross-chain content discovery
- [ ] **Mobile App** - React Native client for on-the-go research
- [ ] **Reputation System** - NFT-based reputation badges for top curators
- [ ] **DAO Treasury** - Protocol fees fund community grants for high-quality research

---

## 👥 Team

Built with ❤️ for the Polkadot Ecosystem.
