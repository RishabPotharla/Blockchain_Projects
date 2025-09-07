import React, { useState } from 'react';
import Web3 from 'web3';

const shorten = (addr) => (addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : '');

const WalletConnect = ({ onWalletConnected }) => {
  const [walletAddress, setWalletAddress] = useState('');
  const [web3, setWeb3] = useState(null);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask.');
      return;
    }
    try {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const addr = accounts?.[0] || '';
      setWalletAddress(addr);
      onWalletConnected(addr);
    } catch (err) {
      console.error('User denied account access', err);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress('');
    setWeb3(null);
    onWalletConnected('');
  };

  return (
    <div className="wallet-container" style={{ textAlign: 'left' }}>
      {!walletAddress ? (
        <button onClick={connectWallet} className="button">
          Connect Metamask
        </button>
      ) : (
        <div className="connected-section" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <button className="button red" onClick={disconnectWallet}>
            Disconnect
          </button>
          <div
            style={{
              fontSize: '0.85rem',
              color: '#333',
              padding: '4px 0',
              wordBreak: 'break-word',
            }}
            title={walletAddress} // Full address on hover
          >
            <strong>Connected Wallet:</strong> {shorten(walletAddress)}
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
