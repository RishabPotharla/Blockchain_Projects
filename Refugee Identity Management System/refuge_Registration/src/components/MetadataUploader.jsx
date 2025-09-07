import React, { useState } from 'react';

// Read from Vite env (must be in project-root .env.local)
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
const PINATA_API_BASE = import.meta.env.VITE_PINATA_API_BASE || 'https://api.pinata.cloud';
const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs';

const MetadataUploader = () => {
  const [formData, setFormData] = useState({
    walletAddress: '',
    name: '',
    age: '',
    gender: '',
    documentType: '',
    documentCID: '',
  });

  const [metadataCID, setMetadataCID] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const createAndUploadMetadata = async () => {
    if (!formData.walletAddress.trim()) return alert('Wallet not connected');
    if (Object.values(formData).some((val) => String(val).trim() === '')) {
      return alert('Please fill in all fields');
    }
    if (!PINATA_JWT) return alert('Missing VITE_PINATA_JWT in .env.local');

    const metadata = {
      ...formData,
      createdAt: new Date().toISOString(),
    };

    try {
      // Upload JSON to Pinata
      const res = await fetch(`${PINATA_API_BASE}/pinning/pinJSONToIPFS`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: JSON.stringify({
          pinataMetadata: { name: `refugee_metadata_${formData.walletAddress}` },
          pinataContent: metadata,
          pinataOptions: { cidVersion: 1 },
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Pinata ${res.status}: ${text}`);
      }

      const data = await res.json(); // { IpfsHash, PinSize, Timestamp }
      const cid = data.IpfsHash || data.cid || '';
      if (!cid) throw new Error('Upload succeeded but no CID returned');

      setMetadataCID(cid);
      console.log('Metadata uploaded with CID:', cid);

    } catch (err) {
      console.error('Metadata upload error:', err);
      alert('Upload failed. Check console for details.');
    }
  };

  return (
    <div className="container">
      <h2>Create Metadata</h2>

      <input
        type="text"
        name="walletAddress"
        placeholder="Public Wallet Address"
        className="input"
        onChange={handleChange}
        value={formData.walletAddress}
      />
      <input
        type="text"
        name="name"
        placeholder="Refugee Name"
        className="input"
        onChange={handleChange}
      />
      <input
        type="number"
        name="age"
        placeholder="Age"
        className="input"
        onChange={handleChange}
      />
      <input
        type="text"
        name="gender"
        placeholder="Gender"
        className="input"
        onChange={handleChange}
      />
      <input
        type="text"
        name="documentType"
        placeholder="Document Type (e.g., ID Proof)"
        className="input"
        onChange={handleChange}
      />
      <input
        type="text"
        name="documentCID"
        placeholder="Proof Document CID"
        className="input"
        onChange={handleChange}
      />

      <button className="button" onClick={createAndUploadMetadata}>
        Create Metadata
      </button>

      {metadataCID && (
        <div style={{ marginTop: '10px' }}>
          <strong>Metadata CID:</strong> {metadataCID} <br />
          <a
            href={`${PINATA_GATEWAY}/${metadataCID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="link"
          >
            View Metadata
          </a>
        </div>
      )}
    </div>
  );
};

export default MetadataUploader;
