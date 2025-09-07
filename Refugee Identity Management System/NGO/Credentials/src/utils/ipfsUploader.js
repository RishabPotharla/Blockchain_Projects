// src/utils/ipfsUploader.js
export async function uploadMetadataToIPFS(file) {
  const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
  const PINATA_API_BASE =
    import.meta.env.VITE_PINATA_API_BASE || 'https://api.pinata.cloud';

  if (!PINATA_JWT) {
    throw new Error('Missing VITE_PINATA_JWT in .env.local');
  }
  if (!file) {
    throw new Error('No file provided to uploadMetadataToIPFS');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('pinataOptions', JSON.stringify({ cidVersion: 1 }));
  formData.append(
    'pinataMetadata',
    JSON.stringify({ name: file.name || 'metadata.json' })
  );

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

  const data = await res.json(); // { IpfsHash, PinSize, Timestamp }
  const cid = data.IpfsHash || data.cid;
  if (!cid) throw new Error('Upload succeeded but no CID returned');
  return cid;
}
