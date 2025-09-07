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
- Upload personal documents to IPFS using **Pinata**.  
- Generate metadata (name, age, gender, doc type, CID) stored as **JSON on IPFS**.  
- Submit metadata CID to the blockchain.  

### NGO Credential Issuer DApp
- NGO staff connect wallet (**MetaMask**).  
- Issue credentials directly on **Avalanche Fuji Testnet**.  
- Credential issuance events are indexed for easy querying.  

### The Graph Integration
- Credentials indexed via a **custom subgraph**.  
- Refugees query credentials on-chain by connecting their wallet and pressing **“Show My Credentials.”**  
- Data is displayed with placeholders (**Name, Age, Gender, Credential Type, Tx Hash**).  

---

## 📂 Project Structure  

```plaintext
Refugee Identity Management System/
│
├── refuge_Registration/       # Refugee registration frontend
│   ├── components/
│   └── .env.local
│
├── NGO/Credentials/           # NGO credential issuer frontend
│   ├── components/
│   └── .env.local
│
└── ngocredential-subgraph/    # The Graph subgraph config
    ├── schema.graphql
    ├── subgraph.yaml
    └── src/mapping.ts
