import React, { useState } from 'react';

const SUBGRAPH_URL = 'https://api.studio.thegraph.com/query/114823/ngo-credential/version/latest';

async function fetchCredentialsForRefugee(address) {
  const addr = (address || '').trim().toLowerCase();

  const query = `
    query($addr: Bytes!) {
      credentials(
        first: 1
        orderBy: timestamp
        orderDirection: desc
        where: { refugee: $addr }
      ) {
        txHash
        issuer
        refugee
        name
        age
        gender
        credentialType
        timestamp
      }
    }`;

  const res = await fetch(SUBGRAPH_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables: { addr } }),
  });

  const json = await res.json();
  if (json.errors) {
    throw new Error(json.errors.map(e => e.message).join(', '));
  }
  return json.data?.credentials?.[0] || null;
}

export default function CheckCredentials() {
  const [wallet, setWallet] = useState('');
  const [status, setStatus] = useState('');
  const [cred, setCred] = useState(null);
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    if (!window.ethereum) return setStatus('Please install MetaMask.');
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWallet(accounts[0] || '');
      setStatus('Wallet connected.');
    } catch {
      setStatus('Wallet connection rejected.');
    }
  };

  const getCredentials = async () => {
    if (!wallet) return setStatus('Connect your wallet first.');
    try {
      setStatus('');
      setLoading(true);
      const data = await fetchCredentialsForRefugee(wallet);
      setCred(data);
      if (!data) setStatus('No credentials found for this address yet.');
    } catch (e) {
      setStatus(`Query error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const short = a => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '');

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ textAlign: 'center' }}>My Credentials</h1>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 16 }}>
        {!wallet ? (
          <button onClick={connectWallet} className="btn btn-green">Connect Wallet</button>
        ) : (
          <span className="muted">Connected: {short(wallet)}</span>
        )}
        <button onClick={getCredentials} className="btn btn-blue">Show My Credentials</button>
      </div>

      {loading && <p style={{ textAlign: 'center' }}>Loading…</p>}

      {cred && !loading && (
        <div className="cid-card" style={{ maxWidth: 680, margin: '12px auto' }}>
          <div><strong>Name:</strong> {cred.name}</div>
          <div><strong>Age:</strong> {cred.age}</div>
          <div><strong>Gender:</strong> {cred.gender}</div>
          <div style={{ wordBreak: 'break-all' }}><strong>Wallet:</strong> {cred.refugee}</div>
          <div><strong>Credential Type:</strong> {cred.credentialType}</div>
          <div style={{ wordBreak: 'break-all' }}><strong>Tx Hash:</strong> {cred.txHash}</div>
          <div><strong>Issued At (unix):</strong> {cred.timestamp}</div>
        </div>
      )}

      {status && <p className="status" style={{ textAlign: 'center' }}>{status}</p>}
    </div>
  );
}
