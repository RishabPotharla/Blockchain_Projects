import React, { useState } from 'react';

// Read from Vite env (exposed to client)
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
const PINATA_API_BASE = import.meta.env.VITE_PINATA_API_BASE || 'https://api.pinata.cloud';
const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs';

const DocumentUpload = () => {
  const [file, setFile] = useState(null);
  const [cid, setCid] = useState(null);
  const [status, setStatus] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files?.[0] || null);
    setCid(null);
    setStatus('');
  };

  const uploadToIPFS = async () => {
    if (!file) return alert('Please select a file');
    if (!PINATA_JWT) return alert('Missing VITE_PINATA_JWT in .env.local');

    setStatus('Uploading to Pinata...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('pinataMetadata', JSON.stringify({ name: file.name }));
      formData.append('pinataOptions', JSON.stringify({ cidVersion: 1 }));

      const res = await fetch(`${PINATA_API_BASE}/pinning/pinFileToIPFS`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Pinata ${res.status}: ${text}`);
      }

      const data = await res.json();
      const newCid = data.IpfsHash || data.cid || '';
      if (!newCid) throw new Error('Upload succeeded but no CID returned');

      setCid(newCid);
      setStatus(''); // clear status on success (keeps UI same as before)
    } catch (err) {
      console.error('Pinata Upload Error:', err);
      setStatus('Upload failed');
    }
  };

  return (
    <div className="container">
      <h2>Upload any proof Document</h2>

      <input
        type="file"
        onChange={handleFileChange}
        className="input"
      />

      <button className="button" onClick={uploadToIPFS}>
        Upload to IPFS
      </button>

      {status && (
        <div style={{ marginTop: '10px' }}>
          {status}
        </div>
      )}

      {cid && (
        <div style={{ marginTop: '10px' }}>
          <strong>IPFS CID:</strong> {cid}<br />
          <a
            href={`${PINATA_GATEWAY}/${cid}`}
            target="_blank"
            rel="noopener noreferrer"
            className="link"
          >
            View Document
          </a>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
