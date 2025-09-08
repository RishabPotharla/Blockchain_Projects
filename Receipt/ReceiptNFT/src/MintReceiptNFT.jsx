// src/MintReceiptNFT.jsx
import React, { useEffect, useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import abi from "./MyNFTAbi.json";
import MetadataBuilder from "./MetadataBuilder.jsx";
import IPFSUpload from "./IPFSUpload.jsx";

const CONTRACT_ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS || "").trim();
const EXPECTED_CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID || 0);

/* ----------------- helpers ----------------- */
function isAddress(str) {
  return /^0x[a-fA-F0-9]{40}$/.test((str || "").trim());
}

// Extract a CID (CIDv1 "baf..." or CIDv0 "Qm...") from ipfs:// or gateway URLs
function extractCid(input) {
  const s = (input || "").trim();
  // ipfs://...
  let m = s.match(/^ipfs:\/\/(?:ipfs\/)?([^/?#]+)/i);
  if (m && m[1]) return m[1];
  // .../ipfs/<cid>
  m = s.match(/\/ipfs\/([^/?#]+)/i);
  if (m && m[1]) return m[1];
  // raw CID
  m = s.match(/\b(baf[0-9a-z]{20,}|Qm[1-9A-HJ-NP-Za-km-z]{44})\b/i);
  if (m && m[1]) return m[1];
  return null;
}

// Normalize to ipfs://<cid>, or throw if no CID found
function normalizeIpfsUri(input) {
  const cid = extractCid(input);
  if (!cid) throw new Error("Metadata URI must start with ipfs:// or contain /ipfs/<cid>.");
  return `ipfs://${cid}`;
}

/* ========================================== */

export default function MintReceiptNFT() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);

  // mint fields
  const [recipient, setRecipient] = useState("");
  const [metadataURI, setMetadataURI] = useState("");

  // builder → pinata flow
  const [builderJson, setBuilderJson] = useState("");
  const [pinnedCid, setPinnedCid] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  /* -------- keep UI synced with wallet -------- */
  useEffect(() => {
    if (!window.ethereum) return;
    const onAccountsChanged = (accs) => {
      if (accs && accs.length) setAccount(accs[0]);
      else {
        setAccount("");
        setContract(null);
        setStatus("Wallet disconnected.");
      }
    };
    const onChainChanged = () => window.location.reload();
    window.ethereum.on("accountsChanged", onAccountsChanged);
    window.ethereum.on("chainChanged", onChainChanged);
    return () => {
      window.ethereum.removeListener("accountsChanged", onAccountsChanged);
      window.ethereum.removeListener("chainChanged", onChainChanged);
    };
  }, []);

  /* ------------- connect / disconnect ------------- */
  async function toggleWallet() {
    try {
      setError("");
      if (!window.ethereum) throw new Error("MetaMask not detected.");

      if (account) {
        try {
          await window.ethereum.request({
            method: "wallet_revokePermissions",
            params: [{ eth_accounts: {} }],
          });
        } catch {}
        setAccount("");
        setContract(null);
        setStatus("Wallet disconnected.");
        return;
      }

      if (!CONTRACT_ADDRESS) throw new Error("Missing VITE_CONTRACT_ADDRESS.");

      const provider = new BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      if (EXPECTED_CHAIN_ID && Number(network.chainId) !== EXPECTED_CHAIN_ID) {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x" + EXPECTED_CHAIN_ID.toString(16) }],
        });
      }

      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      const c = new Contract(CONTRACT_ADDRESS, abi, signer);

      setAccount(addr);
      setContract(c);
      setStatus("Wallet connected.");
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to connect/disconnect wallet.");
    }
  }

  /* ----------------------- MINT ----------------------- */
  async function mint() {
    try {
      setError("");
      setStatus("");
      if (!contract || !account) throw new Error("Wallet not connected.");
      if (!isAddress(recipient)) throw new Error("Invalid recipient address.");
      if (!metadataURI || !extractCid(metadataURI)) {
        throw new Error("Provide a valid ipfs:// metadata URI.");
      }

      setIsLoading(true);
      setStatus("Sending transaction…");

      let tx;
      if (typeof contract.mint === "function") {
        tx = await contract.mint(recipient.trim(), normalizeIpfsUri(metadataURI));
      } else if (typeof contract.mintNFT === "function") {
        tx = await contract.mintNFT(recipient.trim(), normalizeIpfsUri(metadataURI));
      } else {
        throw new Error("Contract has no mint/mintNFT function.");
      }

      const rcpt = await tx.wait();

      let tokenId = null;
      try {
        for (const log of rcpt.logs) {
          if (log.address.toLowerCase() !== CONTRACT_ADDRESS.toLowerCase()) continue;
          try {
            const parsed = contract.interface.parseLog(log);
            if (parsed?.name === "ReceiptMinted" && parsed.args?.tokenId)
              tokenId = parsed.args.tokenId.toString();
            if (!tokenId && parsed?.name === "Transfer" && parsed.args?.tokenId)
              tokenId = parsed.args.tokenId.toString();
          } catch {}
        }
      } catch {}

      setStatus(tokenId ? `Minted! tokenId = ${tokenId}` : "Minted! (check contract for tokenId)");
    } catch (e) {
      console.error(e);
      setError(e.message || "Mint failed.");
    } finally {
      setIsLoading(false);
    }
  }

  // builder → minter hook
  function handleMetadataJson(jsonText) {
    setBuilderJson(jsonText);
    setStatus("Got JSON from builder. Uploading to Pinata…");
  }
  function handlePinned(cid, uri) {
    setPinnedCid(cid);
    setMetadataURI(uri);
    setStatus(`Pinned to Pinata: ${cid} (Metadata URI set)`);
  }

  /* ----------------------- UI ------------------------ */
  return (
    <div className="grid gap">
      {/* LEFT: build metadata */}
      <MetadataBuilder onReady={handleMetadataJson} />

      {/* RIGHT: mint */}
      <div className="card">
        <h2>Mint Receipt NFT</h2>
        <p>
          Paste the <code>ipfs://</code> metadata CID (or use the builder → Pinata flow).
        </p>

        <button className="btn" onClick={toggleWallet}>
          {account ? `Disconnect ${account.slice(0, 6)}…${account.slice(-4)}` : "Connect Wallet"}
        </button>

        <label className="label">
          <span>Recipient Address</span>
          <input
            className="input"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x…"
          />
        </label>

        <label className="label">
          <span>Metadata URI (tokenURI)</span>
          <input
            className="input"
            value={metadataURI}
            onChange={(e) => setMetadataURI(e.target.value)}
            placeholder="ipfs://<metadata-cid>"
          />
        </label>

        <button
          className="btn primary"
          onClick={mint}
          disabled={!account || !recipient || !metadataURI || isLoading}
        >
          {isLoading ? "Minting…" : "Mint NFT"}
        </button>

        {/* Auto-upload to Pinata when builder JSON arrives */}
        {builderJson && (
          <IPFSUpload
            jsonText={builderJson}
            name="receipt-metadata"
            auto={true}
            onPinned={handlePinned}
          />
        )}

        {pinnedCid && (
          <div className="hint" style={{ marginTop: 8 }}>
            Pinned CID: <b>{pinnedCid}</b>
          </div>
        )}

        {status && (
          <div className="alert ok" style={{ marginTop: 8 }}>
            {status}
          </div>
        )}
        {error && (
          <div className="alert err" style={{ marginTop: 8 }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
