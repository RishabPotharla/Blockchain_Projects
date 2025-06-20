# 📸 Photo NFT Minting with IPFS & Pinata

This project allows users to mint NFTs by uploading a photo and its metadata to IPFS using Pinata, then minting the NFT on the Sepolia Ethereum testnet.

## 🎥 YouTube Demo

[Watch the project demo on YouTube](https://youtu.be/I8PYBoL5Tc4?feature=shared)

## 🚀 Features

- Upload image to IPFS using Pinata
- Upload metadata JSON to IPFS
- Mint NFT using a Solidity ERC721 smart contract
- MetaMask integration and Sepolia network switch
- React frontend built with Vite

## 🧾 Environment Variables

Create a `.env` file in the root with:

```
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET_API_KEY=your_pinata_secret_api_key
```

> ⚠️  The .env file is excluded from version control via .gitignore for security purposes.

## 🧪 How to Run

```bash
npm install
npm run dev
```

- Open the app in your browser.
- Connect MetaMask and switch to the Sepolia test network.
- Upload an image, enter NFT details, and mint your NFT.

## 🧠 Tech Stack

- **Frontend:** React + Vite
- **Blockchain:** Solidity, Web3.js
- **Smart Contract:** OpenZeppelin ERC721
- **IPFS Integration:** Pinata
- **Wallet:** MetaMask

## 👤 Author

**Rishab Potharla**
