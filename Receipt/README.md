# Receipt NFT DApp

Mint privacy-safe receipt NFTs (ERC-721) on the Sepolia testnet.  
This DApp includes a metadata builder (with hashed serial/IMEI + warranty calculation), automatic upload to IPFS via Pinata, and a simple UI to mint NFTs from your receipts.

📺 **Demo Video**: [YouTube - Receipt NFT Demo](https://youtu.be/uA7UdSlSVaM?feature=shared)

---

## ✨ Features

- **Receipt Metadata Builder**: Build JSON metadata for receipts including:
  - Merchant ID  
  - Purchase timestamp (with timezone)  
  - Basket totals & line items  
  - Warranty details (auto-calculated)  
  - Product serial / IMEI (hashed only, never stored in plain text)

- **Privacy**: Sensitive info (serial/IMEI) is SHA-256 hashed before inclusion.  
- **IPFS Upload via Pinata**: Metadata is always pinned to IPFS with your Pinata account.  
- **NFT Minting**: Mint your receipts as ERC-721 NFTs directly on Sepolia.  
- **Transferable**: After minting, NFTs can be sent to any other wallet via MetaMask’s NFT tab.  

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/your-username/receipt-nft.git
cd receipt-nft
```

### 2. Install dependencies
```bash
npm install
# or
yarn install
```

### 3. Configure environment

Create a `.env` file in the project root:

```ini
# Your deployed ERC-721 contract on Sepolia
VITE_CONTRACT_ADDRESS=0xBEcF0Ea2A06484E225f2819c2B81b256475260cc  

# Sepolia chain id
VITE_CHAIN_ID=11155111

# Brand image used in metadata
VITE_BRAND_IMAGE_URI=ipfs://bafkreid4pytrh5ruilxemenbmykzm2mscjubyisvsey2ffhj7cuuelix34

# Pinata JWT (required for uploading metadata to IPFS)
# ⚠️ Generate this from Pinata → API Keys → Create JWT
# ⚠️ DO NOT commit your real JWT to GitHub
VITE_PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...<your token here>
```

👉 Note: The `.env` file is **not uploaded** to this repository.  
You must create it locally with your own values.

### 4. Run the app
```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🛠️ Tech Stack
- Frontend: React + Vite  
- Blockchain: Ethers.js v6  
- Storage: IPFS via Pinata  
- Contract: ERC-721 (deployed on Sepolia)  

---

## 📦 Notes
- Requires MetaMask (or another EVM wallet) connected to Sepolia.  
- Always use `ipfs://<cid>` for on-chain `tokenURI`. Gateways (e.g., `https://ipfs.io/ipfs/<cid>`) are fine for previews but not stored on-chain.  
- After minting, NFTs are fully transferable from MetaMask → NFT tab → Select token → Send.  
- **Never commit your real Pinata JWT**. Use environment variables locally or in deployment.  
