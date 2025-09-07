import React, { useState } from 'react';
import Web3 from 'web3';
import { CONTRACT_ABI } from './abi/contractABI';
import './index.css';

const CONTRACT_ADDRESS = '0x67ce182d144199718B79101A8b289bb025E08F52';
const EXPLORER_BASE_URL = 'https://testnet.snowtrace.io/tx/';

// ---- Avalanche Fuji (C-Chain) params ----
const FUJI_PARAMS = {
  chainId: '0xa869', // 43113 in hex
  chainName: 'Avalanche Fuji C-Chain',
  nativeCurrency: { name: 'Avalanche', symbol: 'AVAX', decimals: 18 },
  rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
  blockExplorerUrls: ['https://testnet.snowtrace.io/'],
};

async function switchToFuji() {
  // Switch if added; otherwise add then switch
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: FUJI_PARAMS.chainId }],
    });
  } catch (err) {
    if (err?.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [FUJI_PARAMS],
      });
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: FUJI_PARAMS.chainId }],
      });
    } else {
      throw err;
    }
  }
}

async function ensureFuji() {
  if (!window.ethereum) throw new Error('MetaMask not found');
  const current = await window.ethereum.request({ method: 'eth_chainId' });
  if (current?.toLowerCase() !== FUJI_PARAMS.chainId) {
    await switchToFuji();
  }
}

export default function NGOIssuer() {
  const [refugeeAddress, setRefugeeAddress] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [credentialType, setCredentialType] = useState('');
  const [txHash, setTxHash] = useState('');
  const [status, setStatus] = useState('');
  const [connectedAddress, setConnectedAddress] = useState('');

  const connectWallet = async () => {
    if (!window.ethereum) return setStatus('Please install MetaMask.');
    try {
      await ensureFuji(); // <-- make sure we’re on Avalanche Fuji
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setConnectedAddress(accounts[0] || '');
      setStatus('Wallet connected to Avalanche Fuji.');
    } catch (e) {
      console.error(e);
      setStatus(e?.message || 'Wallet connection rejected.');
    }
  };

  const disconnectWallet = () => {
    setConnectedAddress('');
    setStatus('Wallet disconnected.');
  };

  const handleIssue = async () => {
    if (!refugeeAddress || !name || !age || !gender || !credentialType) {
      setStatus('Please fill in all fields.');
      return;
    }
    if (!connectedAddress) {
      setStatus('Please connect your wallet first.');
      return;
    }

    const ageNum = Number(age);
    if (!Number.isInteger(ageNum) || ageNum < 0 || ageNum > 255) {
      setStatus('Age must be an integer 0–255.');
      return;
    }

    try {
      await ensureFuji(); // <-- ensure network before sending tx
      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

      const tx = await contract.methods
        .issueCredential(refugeeAddress, name, ageNum, gender, credentialType)
        .send({ from: connectedAddress });

      setTxHash(tx.transactionHash);
      setStatus('✅ Credential submitted to blockchain!');
    } catch (error) {
      console.error(error);
      setStatus(`Blockchain transaction error: ${error?.message || error}`);
    }
  };

  return (
    <div className="ngo-container">
      <h1 className="title">NGO Credential Issuer</h1>

      {!connectedAddress ? (
        <button onClick={connectWallet} className="btn btn-green mb">
          Connect Wallet
        </button>
      ) : (
        <button onClick={disconnectWallet} className="btn btn-red mb">
          Disconnect Wallet
        </button>
      )}

      {connectedAddress && (
        <p className="muted mb break">{`Connected: ${connectedAddress}`}</p>
      )}

      <div className="field mb">
        <label className="label">Refugee Wallet Address:</label>
        <input
          type="text"
          className="input"
          value={refugeeAddress}
          onChange={(e) => setRefugeeAddress(e.target.value)}
        />
      </div>

      <div className="field mb">
        <label className="label">Name:</label>
        <input
          type="text"
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="field mb">
        <label className="label">Age:</label>
        <input
          type="number"
          className="input"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />
      </div>

      <div className="field mb">
        <label className="label">Gender:</label>
        <input
          type="text"
          className="input"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
        />
      </div>

      <div className="field mb">
        <label className="label">Credential Type:</label>
        <input
          type="text"
          className="input"
          value={credentialType}
          onChange={(e) => setCredentialType(e.target.value)}
        />
      </div>

      <button onClick={handleIssue} className="btn btn-yellow mt-6">
        🚀 Issue Credential
      </button>

      {txHash && (
        <p className="info break">
          TX Hash:{' '}
          <a
            href={`${EXPLORER_BASE_URL}${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="link"
          >
            {txHash}
          </a>
        </p>
      )}

      {status && <p className="status break">{status}</p>}
    </div>
  );
}
