# 🛡 Refugee Identity Management System

🔗 Demo Video: https://youtu.be/Qy04IhgOBEs?feature=shared  

This project is a Web3-based identity management system deployed on the **Avalanche Fuji Testnet**.  
It leverages **smart contracts, IPFS (via Pinata), and The Graph** to create a decentralized flow where:

- Refugees register and upload documents.  
- NGO staff validate and issue credentials on-chain.  
- Credentials are indexed by The Graph for refugees to later retrieve easily.  

The system ensures **trustless verification, transparency, and data integrity** without relying on centralized authorities or paper records.

---

## 🚀 Features

### Refugee Registration DApp
- Upload personal documents to **IPFS using Pinata**.  
- Generate metadata (name, age, gender, doc type, CID) stored as **JSON on IPFS**.  
- Submit metadata CID to the blockchain.  

### NGO Credential Issuer DApp
- NGO staff connect wallet (**MetaMask**).  
- Issue credentials directly on **Avalanche Fuji Testnet**.  
- Credential issuance events are indexed for easy querying.  

### The Graph Integration
- Credentials indexed via a **custom subgraph**.  
- Refugees query credentials on-chain by connecting their wallet and pressing **“Show My Credentials.”**  
- Data is displayed with placeholders (Name, Age, Gender, Credential Type, Tx Hash).  

---

## 📂 Project Structure

```bash
Refugee Identity Management System/
│
├── refuge_Registration/        # Refugee registration frontend
│   ├── components/
│   └── .env.local
│
├── NGO/Credentials/            # NGO credential issuer frontend
│   ├── components/
│   └── .env.local
│
└── ngocredential-subgraph/     # The Graph subgraph config
    ├── schema.graphql
    ├── subgraph.yaml
    └── src/mapping.ts
⚙️ Environment Setup

Both DApps require a .env.local file in their respective directories.
⚠️ Note: These files are not uploaded for security reasons — you must create them manually.

📌 NGO/Credentials .env.local
VITE_PINATA_JWT=<your-pinata-jwt>
VITE_PINATA_GATEWAY=https://gateway.pinata.cloud/ipfs
VITE_PINATA_API_BASE=https://api.pinata.cloud
VITE_NGO_SUBGRAPH=https://api.studio.thegraph.com/query/114823/ngo-credential/version/latest

📌 refuge_Registration .env.local
VITE_PINATA_JWT=<your-pinata-jwt>
VITE_PINATA_GATEWAY=https://gateway.pinata.cloud/ipfs
VITE_PINATA_API_BASE=https://api.pinata.cloud
VITE_NGO_SUBGRAPH=https://api.studio.thegraph.com/query/114823/ngo-credential/version/latest


⚠️ You must also generate your own Pinata JWT and Subgraph deploy key.

🛠️ Tech Stack

Smart Contracts → Solidity, deployed on Avalanche Fuji Testnet

Storage → IPFS via Pinata API

Frontend → React.js (Vite), Web3.js

Indexing → The Graph (Subgraph deployed on Studio)

Wallet → MetaMask

📝 Run Locally
Refugee Registration DApp
cd refuge_Registration
npm install
npm run dev

NGO Credential Issuer DApp
cd NGO/Credentials
npm install
npm run dev

Subgraph (inside refuge_Registration/ngocredential-subgraph)
cd refuge_Registration/ngocredential-subgraph
npm install
npx graph codegen
npx graph build
npx graph deploy ngo-credential subgraph.yaml --deploy-key <YOUR_DEPLOY_KEY>

🔄 Usage Flow

Refugee uploads document → Metadata JSON created → CID stored on blockchain.

NGO staff review metadata → Issue credential → Transaction stored on Avalanche Fuji Testnet.

The Graph indexes CredentialIssued events.

Refugee connects wallet → presses Show My Credentials → Sees their verified data fetched via GraphQL.

📖 Learning Outcomes

Built a two-DApp architecture for refugees and NGOs.

Indexed blockchain data with The Graph for frontend queries.

Integrated IPFS + Blockchain + Graph into one cohesive project.

Improved Web3 UX with wallet-based access control.

📌 Future Improvements

Add zero-knowledge proofs (ZKPs) for privacy-preserving identity verification.

Support for multi-chain deployment beyond Avalanche Fuji.

Implement role-based access for NGOs to manage credential issuance securely.
