import React from "react";
import MintReceiptNFT from "./MintReceiptNFT";

export default function App() {
  return (
    <div className="container">
      <header className="app-header">
        <div className="brand">
          <span className="brand-badge" />
          Receipt NFT Studio
        </div>
        <div className="muted">privacy-safe • verifiable • warranty-ready</div>
      </header>
      <MintReceiptNFT />
    </div>
  );
}
