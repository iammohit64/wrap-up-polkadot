# Wrap-Up: Decentralized Articles Curation Platform

<div align="center">

![Wrap-Up Logo](https://img.shields.io/badge/Wrap--Up-Decentralized%20Truth-10b981?style=for-the-badge)

**The Intelligence Layer for the Verifiable Web**

[![Arbitrum](https://img.shields.io/badge/Arbitrum-Sepolia-blue.svg)](https://sepolia.arbiscan.io)
[![React](https://img.shields.io/badge/React-19.1.1-61DAFB.svg?logo=react)](https://reactjs.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.30-363636.svg?logo=solidity)](https://soliditylang.org/)

[Live Demo](https://wrap-up-arbitrum-zqup.vercel.app) • [Documentation](#setup-guide) 

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Smart Contracts](#smart-contracts)
- [Setup Guide](#setup-guide)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Future Enhancements](#future-enhancements)

---

## 🌟 Overview

**Wrap-Up** is a decentralized document curation platform built on the Arbitrum blockchain that enables users to scrape, analyze, and curate articles with verifiable on-chain records. The platform combines AI-powered content analysis with blockchain technology to create a transparent, community-driven news ecosystem.

### The Problem

- Traditional news platforms lack transparency in curation
- Centralized content moderation leads to bias
- No verifiable record of article popularity or engagement
- Readers cannot trust content authenticity

### Our Solution

Wrap-Up creates a **decentralized curation layer** where:
- Articles are scraped and analyzed using AI
- Summaries are stored on IPFS for permanence
- Curation records are immutably stored on Arbitrum blockchain
- Community voting creates transparent article rankings
- Users earn $MFD tokens for quality contributions

---

## ✨ Key Features

### 🤖 AI-Powered Analysis
- **Intelligent Scraping**: Extracts content from any article URL using metascraper
- **Multi-Platform Support**: Works with standard articles, LinkedIn posts, and Twitter/X
- **Smart Summarization**: Uses Groq AI (Llama 3.1) to generate:
  - Quick summaries (50-80 words)
  - Detailed analysis (200-300 words)
  - Key takeaways and statistics
  - Condensed content for easy reading

### ⛓️ Blockchain Integration
- **On-Chain Curation**: Articles minted as permanent blockchain records
- **IPFS Storage**: Decentralized content storage via Pinata
- **Smart Contract Voting**: Transparent upvoting system
- **User Points System**: Earn points for contributions
- **Token Rewards**: Claim $MFD tokens based on accumulated points

### 💬 Community Engagement
- **Nested Comments**: Support for replies and discussions
- **Comment Voting**: Upvote valuable comments
- **Leaderboard**: Top articles ranked by engagement score
- **User Profiles**: Custom display names stored on-chain
- **Anonymous Participation**: Comment without wallet connection

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark Theme**: Eye-friendly interface with emerald accents
- **Real-time Updates**: Live contract event listening
- **Optimistic UI**: Instant feedback with background syncing
- **Toast Notifications**: Clear user feedback for all actions

---

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.1.1 | UI framework |
| **Vite** | 7.1.7 | Build tool & dev server |
| **Tailwind CSS** | 4.1.16 | Styling framework |
| **React Router** | 7.9.5 | Client-side routing |
| **Zustand** | 5.0.8 | State management |
| **Wagmi** | 2.19.1 | Ethereum interactions |
| **Viem** | 2.38.5 | Ethereum utilities |
| **Web3Modal** | 5.1.11 | Wallet connection |
| **React Hot Toast** | 2.6.0 | Notifications |
| **Axios** | 1.13.1 | HTTP client |
| **Lucide React** | 0.548.0 | Icon library |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | - | Runtime environment |
| **Express** | 5.1.0 | Web framework |
| **Prisma** | 6.18.0 | Database ORM |
| **MongoDB** | - | Database |
| **Groq SDK** | 0.34.0 | AI summarization |
| **Metascraper** | 5.49.5 | Web scraping |
| **Cheerio** | 1.1.2 | HTML parsing |
| **Axios** | 1.13.1 | HTTP requests |
| **Pinata** | - | IPFS gateway |

### Smart Contracts
| Technology | Version | Purpose |
|------------|---------|---------|
| **Solidity** | 0.8.30 | Smart contract language |
| **Foundry** | - | Development framework |
| **OpenZeppelin** | 5.5.0 | Contract libraries |
| **Arbitrum Sepolia** | - | Test network |

### DevOps & Deployment
- **Vercel**: Frontend hosting
- **Render**: Backend hosting
- **MongoDB Atlas**: Database hosting
- **Pinata**: IPFS pinning service

---

## 🏗️ Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                           │
│                    (React + Tailwind CSS)                        │
└───────────────────┬─────────────────────────┬───────────────────┘
                    │                         │
                    ▼                         ▼
        ┌───────────────────┐     ┌──────────────────────┐
        │   Wagmi/Viem      │     │   Axios + Zustand    │
        │  (Web3 Layer)     │     │   (API Layer)        │
        └─────────┬─────────┘     └──────────┬───────────┘
                  │                          │
                  ▼                          ▼
        ┌──────────────────┐     ┌───────────────────────┐
        │ Smart Contracts  │     │   Express Backend     │
        │  (Solidity)      │     │   (Node.js + Prisma)  │
        └─────────┬────────┘     └──────────┬────────────┘
                  │                          │
                  │                          ▼
                  │              ┌───────────────────────┐
                  │              │   MongoDB Database    │
                  │              └───────────────────────┘
                  │                          │
                  ▼                          ▼
        ┌──────────────────────────────────────────────┐
        │            Arbitrum Blockchain                │
        │         (Immutable Records)                   │
        └──────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   IPFS (Pinata)  │
                    │ (Content Storage)│
                    └──────────────────┘
```

### Data Flow

1. **Article Submission**:
```
   User Input → AI Analysis (Groq) → IPFS Upload → DB Storage → 
   Smart Contract → Blockchain Confirmation → DB Sync
```

2. **Voting**:
```
   User Vote → Optimistic UI Update → Smart Contract Write → 
   Event Emission → DB Sync → UI Refresh
```

3. **Commenting**:
```
   Comment Text → DB Creation → IPFS Upload → Smart Contract → 
   Event Listening → DB Update → UI Refresh
```

---

## 📁 Folder Structure
```
wrap-up/
│
├── frontend/                           # React frontend application
│   ├── public/                         # Static assets
│   │   ├── linkedin_fallback.png       # LinkedIn default image
│   │   └── x_fallback.png              # Twitter/X default image
│   │
│   ├── src/
│   │   ├── assets/                     # Media assets
│   │   │   └── react.svg
│   │   │
│   │   ├── components/                 # Reusable React components
│   │   │   ├── ArticleCard.jsx         # Article preview card
│   │   │   ├── Footer.jsx              # Site footer
│   │   │   ├── InshortCard.jsx         # Compact article card
│   │   │   ├── Leaderboard.jsx         # Top articles ranking
│   │   │   └── Navbar.jsx              # Navigation bar
│   │   │
│   │   ├── pages/                      # Route pages
│   │   │   ├── ArticleDetailsPage.jsx  # Full article view
│   │   │   ├── CuratedArticlesPage.jsx # Article listing
│   │   │   └── LandingPage.jsx         # Homepage
│   │   │
│   │   ├── stores/                     # State management
│   │   │   └── articleStore.js         # Zustand store
│   │   │
│   │   ├── App.jsx                     # Root component
│   │   ├── main.jsx                    # App entry point
│   │   ├── index.css                   # Global styles
│   │   └── wagmiConfig.js              # Web3 configuration
│   │
│   ├── .env.example                    # Environment variables template
│   ├── .gitignore                      # Git ignore rules
│   ├── eslint.config.js                # ESLint configuration
│   ├── index.html                      # HTML template
│   ├── package.json                    # Dependencies
│   └── vite.config.js                  # Vite configuration
│
├── backend/                            # Express backend server
│   ├── controllers/                    # Route controllers
│   │   ├── articleController.js        # Article CRUD operations
│   │   ├── commentController.js        # Comment management
│   │   ├── leaderboardController.js    # Rankings logic
│   │   └── userController.js           # User profiles
│   │
│   ├── middlewares/                    # Express middlewares
│   │   └── errorHandler.js             # Global error handler
│   │
│   ├── prisma/                         # Database schema
│   │   └── schema.prisma               # Prisma models
│   │
│   ├── routes/                         # API routes
│   │   ├── articleRoutes.js            # /api/articles/*
│   │   ├── commentRoutes.js            # /api/comments/*
│   │   ├── leaderboardRoutes.js        # /api/leaderboard/*
│   │   └── userRoutes.js               # /api/users/*
│   │
│   ├── services/                       # Business logic
│   │   ├── ipfs.js                     # IPFS operations
│   │   ├── scraper.js                  # Web scraping
│   │   └── summarizer.js               # AI summarization
│   │
│   ├── .env.example                    # Environment template
│   ├── .gitignore                      # Git ignore rules
│   ├── index.js                        # Server entry point
│   └── package.json                    # Dependencies
│
├── contracts/                          # Smart contracts
│   ├── src/                            # Solidity source files
│   │   ├── MonadFeed.sol               # Main curation contract
│   │   ├── MFD.sol                     # ERC20 token contract
│   │   └── MFDClaimer.sol              # Token claim contract
│   │
│   ├── script/                         # Deployment scripts
│   │   ├── DeployMonadFeed.s.sol       # Deploy main contract
│   │   ├── DeployMFD.s.sol             # Deploy token
│   │   ├── DeployMFDClaimer.s.sol      # Deploy claimer
│   │   └── MintTokens.s.sol            # Mint initial supply
│   │
│   ├── broadcast/                      # Deployment logs
│   ├── .gitignore                      # Git ignore rules
│   ├── foundry.toml                    # Foundry config
│   └── foundry.lock                    # Dependency lock
│
├── .gitignore                          # Root git ignore
└── README.md                           # This file
```

### Key Directories Explained

#### Frontend Structure
- **`components/`**: Reusable UI components following atomic design principles
- **`pages/`**: Route-level components mapped to URL paths
- **`stores/`**: Zustand state management with API integration
- **`wagmiConfig.js`**: Web3 setup including chain configs and contract ABIs

#### Backend Structure
- **`controllers/`**: Handle HTTP requests and responses
- **`services/`**: Contain business logic separated from routes
- **`routes/`**: Define API endpoints and route handlers
- **`prisma/`**: Database schema with MongoDB models

#### Contracts Structure
- **`src/`**: Solidity smart contracts
- **`script/`**: Foundry deployment and utility scripts
- **`broadcast/`**: Transaction logs from deployments

---

## 📜 Smart Contracts

### MonadFeed.sol
**Main curation contract** managing articles, comments, and voting.

**Key Functions:**
- `submitArticle(string ipfsHash)`: Mint article to blockchain
- `upvoteArticle(uint256 articleId)`: Vote for article
- `postComment(uint256 articleId, string ipfsHash)`: Add comment
- `upvoteComment(uint256 commentId)`: Vote for comment
- `setDisplayName(string name)`: Set user display name
- `getUserPoints(address user)`: Get user's points

**Events:**
- `ArticleSubmitted`: Emitted on article creation
- `ArticleUpvoted`: Emitted on article vote
- `CommentPosted`: Emitted on new comment
- `CommentUpvoted`: Emitted on comment vote
- `PointsAwarded`: Emitted when user earns points

### MFD.sol
**ERC20 token contract** for platform rewards.

**Key Functions:**
- `mint(address to, uint256 amount)`: Mint new tokens (owner only)
- `transfer(address to, uint256 amount)`: Transfer tokens
- `balanceOf(address account)`: Check token balance

### MFDClaimer.sol
**Token distribution contract** for claiming rewards.

**Key Functions:**
- `claimReward()`: Claim tokens based on points (10 $MFD per point)
- `hasClaimed(address user)`: Check if user already claimed

**Constants:**
- `POINTS_TO_TOKEN_RATE`: 10 tokens per point (10^18 wei)

### Deployed Addresses (Arbitrum Sepolia)
```javascript
MonadFeed deployed to: 0x1e9f2F91E0673E3313C68b49a2262814C7d8921e
MFD Token deployed to: 0xA5123b6D0e67b634DA8DC118DE99F72f24B6A33a
MFD Claimer deployed to: 0x0b8Fe0D4e677E6a99b2B47b2F34A0e0D85240C24
```

---

## 🚀 Setup Guide

### Prerequisites

- **Node.js** >= 18.x
- **npm** or **yarn**
- **MongoDB** (local or Atlas)
- **Foundry** (for contracts)
- **MetaMask** or compatible wallet
- **Arbitrum Sepolia testnet** ETH tokens

### Environment Variables

#### Frontend (.env)
```bash
VITE_CONTRACT_ADDRESS=0x1e9f2F91E0673E3313C68b49a2262814C7d8921e
VITE_MFD_TOKEN_ADDRESS=your_token_address
VITE_MFD_CLAIMER_ADDRESS=your_claimer_address
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_id
```

#### Backend (.env)
```bash
PORT=5001
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/wrapup"

# AI Services
GROQ_API_KEY=your_groq_api_key

# IPFS (Pinata)
PINATA_API_KEY=your_pinata_key
PINATA_SECRET_KEY=your_pinata_secret

# CORS
FRONTEND_URL=https://wrap-up-arbitrum-zqup.vercel.app
```

#### Contracts (.env)
```bash
PRIVATE_KEY=your_wallet_private_key
ARBITRUM_SEPOLIA_RPC=https://sepolia-rollup.arbitrum.io/rpc
MONADFEED_ADDRESS=0x1e9f2F91E0673E3313C68b49a2262814C7d8921e
MFD_TOKEN_ADDRESS=your_token_address
MFD_CLAIMER_ADDRESS=your_claimer_address
```

### Installation Steps

#### 1. Clone Repository
```bash
git clone https://github.com/yourusername/wrap-up.git
cd wrap-up
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your values
npm run dev
```

Frontend runs at: `http://localhost:5173`

#### 3. Backend Setup
```bash
cd ../backend
npm install
cp .env.example .env
# Edit .env with your values

# Setup Prisma
npx prisma generate
npx prisma db push

# Start server
npm run dev
```

Backend runs at: `http://localhost:5001`

#### 4. Smart Contracts Setup
```bash
cd ../contracts

# Install dependencies
forge install

# Compile contracts
forge build

# Deploy contracts (ensure .env is configured)
forge script script/DeployMonadFeed.s.sol --rpc-url $ARBITRUM_SEPOLIA_RPC --broadcast

# Deploy token
forge script script/DeployMFD.s.sol --rpc-url $ARBITRUM_SEPOLIA_RPC --broadcast

# Deploy claimer
forge script script/DeployMFDClaimer.s.sol --rpc-url $ARBITRUM_SEPOLIA_RPC --broadcast

# Mint tokens to claimer
forge script script/MintTokens.s.sol --rpc-url $ARBITRUM_SEPOLIA_RPC --broadcast
```

#### 5. Configure Frontend with Deployed Addresses
Update `frontend/.env`:
```bash
VITE_WALLETCONNECT_PROJECT_ID=8ea82f9becdc86a906aa7c365094cc31
VITE_CONTRACT_ADDRESS=0x1e9f2F91E0673E3313C68b49a2262814C7d8921e
VITE_MFD_TOKEN_ADDRESS=0xA5123b6D0e67b634DA8DC118DE99F72f24B6A33a
VITE_MFD_CLAIMER_ADDRESS=0x0b8Fe0D4e677E6a99b2B47b2F34A0e0D85240C24
```

#### 6. Get Testnet Tokens
- Visit [Arbitrum Sepolia Faucet](https://faucet.quicknode.com/arbitrum/sepolia)
- Connect wallet and request testnet ETH

### Verification

1. **Frontend**: Navigate to `http://localhost:5173` - should see landing page
2. **Backend**: Visit `http://localhost:5001/health` - should return `{"status": "OK"}`
3. **Contracts**: Check contract on [Arbitrum Sepolia Explorer](https://sepolia.arbiscan.io)

---

## 📖 Usage

### For Readers

1. **Browse Articles**
   - Visit curated articles page
   - View leaderboard for top content
   - Click articles to read full analysis

2. **Connect Wallet**
   - Click "Connect Wallet" in navbar
   - Approve connection in MetaMask
   - Switch to Arbitrum Sepolia if needed

3. **Engage with Content**
   - Upvote articles you find valuable
   - Comment and reply to discussions
   - Upvote insightful comments

4. **Earn Rewards**
   - Accumulate points from contributions
   - Click "Claim $MFD" to receive tokens
   - One-time claim: 10 $MFD per point

### For Curators

1. **Submit Article**
   - Paste article URL on landing page
   - Click "Analyze" - AI extracts content
   - Review preview summary
   - Click "Sign & Mint" to curate
   - Confirm transaction in wallet

2. **Track Performance**
   - Monitor upvotes on your articles
   - View comments and engagement
   - Earn points for quality curation

### For Developers

#### API Endpoints

**Articles**
```bash
GET    /api/articles/all              # Get all articles
GET    /api/articles/:id              # Get article by ID
GET    /api/articles/by-url?url=...   # Get by URL
POST   /api/articles/scrape           # Scrape & analyze
POST   /api/articles/prepare          # Save to DB
POST   /api/articles/upload-ipfs      # Upload to IPFS
POST   /api/articles/mark-onchain     # Mark as on-chain
POST   /api/articles/upvote            # Upvote article
```

**Comments**
```bash
GET    /api/comments/by-article?articleUrl=...  # Get comments
POST   /api/comments                             # Create comment
POST   /api/comments/upload-ipfs                 # Upload to IPFS
POST   /api/comments/mark-onchain                # Mark on-chain
POST   /api/comments/upvote                      # Upvote comment
```

**Users**
```bash
GET    /api/users/:walletAddress      # Get user
POST   /api/users/set-display-name    # Set name
POST   /api/users/get-or-create       # Get/create user
```

**Leaderboard**
```bash
GET    /api/leaderboard/top           # Top 5 articles
GET    /api/leaderboard/stats         # Platform stats
```

#### Smart Contract Interaction
```javascript
import { useWriteContract } from 'wagmi';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from './wagmiConfig';

// Submit article
const { writeContract } = useWriteContract();
writeContract({
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI,
  functionName: 'submitArticle',
  args: [ipfsHash],
});

// Upvote article
writeContract({
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI,
  functionName: 'upvoteArticle',
  args: [articleId],
});
```

---

## 🔮 Future Enhancements

### Phase 1: Enhanced Curation (Q2 2025)
- [ ] **Multi-language Support**: Translate summaries to 10+ languages
- [ ] **Video Content**: Support for YouTube and video platforms
- [ ] **Podcast Integration**: Transcribe and curate podcast episodes
- [ ] **RSS Feeds**: Auto-curate from trusted RSS sources
- [ ] **Browser Extension**: One-click curation from any webpage

### Phase 2: Advanced Features (Q3 2025)
- [ ] **AI-Powered Moderation**: Detect spam and low-quality content
- [ ] **Reputation System**: Trust scores based on curation history
- [ ] **Topic Categorization**: AI-based article tagging
- [ ] **Trending Algorithm**: Smart ranking beyond simple votes
- [ ] **Bookmark Collections**: Save and organize favorite articles

### Phase 3: Social & Governance (Q4 2025)
- [ ] **User Following**: Follow curators and get personalized feeds
- [ ] **DAO Governance**: Community voting on platform decisions
- [ ] **Staking Mechanism**: Stake $MFD for boosted rewards
- [ ] **NFT Badges**: Achievement badges for top contributors
- [ ] **Collaborative Curation**: Multi-user article submissions

### Phase 4: Ecosystem Growth (2026)
- [ ] **Mobile Apps**: Native iOS and Android applications
- [ ] **API Marketplace**: Sell curated data to AI companies
- [ ] **Cross-chain Bridge**: Deploy on Ethereum, Polygon, etc.
- [ ] **Fact-Checking Layer**: Integrate with fact-checking services
- [ ] **Monetization**: Share ad revenue with top curators

### Technical Improvements
- [ ] **GraphQL API**: More efficient data fetching
- [ ] **WebSocket Support**: Real-time updates without polling
- [ ] **CDN Integration**: Faster global content delivery
- [ ] **Advanced Analytics**: Dashboard for curators
- [ ] **A/B Testing**: Optimize UI/UX with experiments
- [ ] **Performance Optimization**: Reduce bundle size, lazy loading
- [ ] **Test Coverage**: Comprehensive unit and integration tests

---

## 🙏 Acknowledgments

- **Arbitrum**: For providing fast and affordable L2 blockchain infrastructure
- **Groq**: For lightning-fast AI inference
- **IPFS/Pinata**: For decentralized storage
- **OpenZeppelin**: For secure smart contract libraries
- **Vercel**: For seamless frontend deployment
- **Render**: For reliable backend hosting

---

## 🔗 Links

- [Live Application](https://wrap-up-arbitrum-zqup.vercel.app)
- [Smart Contract Explorer](https://sepolia.arbiscan.io/address/0x1e9f2F91E0673E3313C68b49a2262814C7d8921e)
- [API Documentation](https://wrap-up.onrender.com/api)
- [Arbitrum Network Docs](https://docs.arbitrum.io)
- [Foundry Book](https://book.getfoundry.sh)

---

<div align="center">

**Built with ❤️ by the Wrap-Up Team**

*Decentralizing truth, one article at a time.*

</div>
