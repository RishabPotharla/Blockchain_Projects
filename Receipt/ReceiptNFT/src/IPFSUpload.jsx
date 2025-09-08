// src/IPFSUpload.jsx
import React, { useEffect, useState } from "react";

/**
 * Upload JSON metadata to Pinata using a JWT (client-side).
 * NOTE: Shipping a JWT in frontend code exposes it to users.
 * Use only for experiments / internal tools.
 */
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT; // put your JWT in .env
const PIN_JSON_URL = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

export default function IPFSUpload({
  jsonText,                 // stringified JSON from MetadataBuilder
  name = "receipt-metadata",
  auto = true,              // auto-upload when jsonText changes
  onPinned,                 // (cid, uri) => void
}) {
  const [cid, setCid] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function pinNow() {
    try {
      setError(""); setStatus("Uploading to Pinata…"); setIsLoading(true);
      if (!PINATA_JWT) throw new Error("Missing VITE_PINATA_JWT env var.");
      if (!jsonText?.trim()) throw new Error("No JSON to upload.");

      let content;
      try { content = JSON.parse(jsonText); }
      catch { throw new Error("Invalid JSON string."); }

      const body = {
        pinataOptions: { cidVersion: 1 },
        pinataMetadata: { name },
        pinataContent: content,
      };

      const res = await fetch(PIN_JSON_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg =
          data?.error?.details?.[0]?.message ||
          data?.error ||
          JSON.stringify(data);
        throw new Error(`Pinata error: ${msg}`);
      }

      const _cid = data.IpfsHash;
      const uri = `ipfs://${_cid}`;
      setCid(_cid);
      setStatus("Pinned!");
      onPinned?.(_cid, uri);
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to pin.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { if (auto && jsonText) pinNow(); /* eslint-disable-next-line */ }, [jsonText]);

  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); setStatus("Copied!"); }
    catch { /* ignore */ }
  };

  return (
    <div className="grid gap" style={{ marginTop: 8 }}>
      {!auto && (
        <button className="btn" onClick={pinNow} disabled={isLoading}>
          {isLoading ? "Uploading…" : "Upload to Pinata"}
        </button>
      )}

      {cid && (
        <div className="grid row2">
          <input className="input" readOnly value={cid} />
          <button className="btn" onClick={() => copy(cid)}>Copy CID</button>
        </div>
      )}

      {cid && (
        <div className="grid row2">
          <input className="input" readOnly value={`ipfs://${cid}`} />
          <button className="btn" onClick={() => copy(`ipfs://${cid}`)}>Copy URI</button>
        </div>
      )}

      {status && <div className="hint ok">{status}</div>}
      {error && <div className="alert err">{error}</div>}
    </div>
  );
}
