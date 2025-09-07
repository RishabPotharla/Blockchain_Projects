import React, { useState } from 'react';
import Web3 from 'web3';
import ContractABI from '../Refugeeidentity.json';

const CONTRACT_ADDRESS = '0x7150de775f6b29a5bb476fa769a5bb6a6df59bac';

const SubmitCID = ({ connectedWallet }) => {
  const [cid, setCid] = useState('');
  const [txHash, setTxHash] = useState('');

  const handleSubmit = async () => {
    if (!cid || !connectedWallet) {
      return alert('Missing CID or wallet not connected');
    }

    try {
      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(ContractABI, CONTRACT_ADDRESS);

      const tx = await contract.methods.uploadMetadata(cid).send({
        from: connectedWallet
      });

      console.log('Transaction successful:', tx.transactionHash);
      setTxHash(tx.transactionHash);
    } catch (err) {
      console.error('Smart contract call failed:', err);
      alert('Transaction failed: ' + err.message);
    }
  };

  return (
    <div className="container">
      <h2>Submit Metadata CID to Blockchain</h2>

      <input
        type="text"
        placeholder="Enter Metadata CID"
        value={cid}
        onChange={(e) => setCid(e.target.value)}
        className="input"
      />

      <button className="button" onClick={handleSubmit}>
        Submit to Blockchain
      </button>

      {txHash && (
        <div className="mt">
          <strong>Transaction Hash:</strong> <br />
          <a
            href={`https://testnet.snowtrace.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="link"
          >
            View on Snowtrace
          </a>
        </div>
      )}
    </div>
  );
};

export default SubmitCID;
