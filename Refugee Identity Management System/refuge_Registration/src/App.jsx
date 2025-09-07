import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import WalletConnect from './components/WalletConnect';
import DocumentUpload from './components/DocumentUpload';
import MetadataUploader from './components/MetadataUploader';
import SubmitCID from './components/SubmitCID';
import CheckCredentials from './components/CheckCredentials'; // ← NEW
import './index.css';

function Home() {
  const [wallet, setWallet] = useState('');
  const navigate = useNavigate();

  return (
    <div style={{ padding: '2rem' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Left side - Connect Metamask */}
        <WalletConnect onWalletConnected={setWallet} />

        {/* Center - Title */}
        <h1 style={{ margin: 0, textAlign: 'center', flex: 1 }}>Refugee Registration</h1>

        {/* Right side - Show My Credentials */}
        <button
          className="btn btn-blue"
          onClick={() => navigate('/check-credentials')}
          style={{ padding: '8px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Show My Credentials
        </button>
      </div>

      <hr style={{ margin: '2rem 0' }} />

      <h2>Upload Documents</h2>
      <DocumentUpload />

      <MetadataUploader walletAddress={wallet} />
      <SubmitCID connectedWallet={wallet} />
    </div>
  );
}


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/check-credentials" element={<CheckCredentials />} />
      </Routes>
    </BrowserRouter>
  );
}
