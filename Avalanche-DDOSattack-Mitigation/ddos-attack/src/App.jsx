import React, { useState, useEffect } from "react";
import Web3 from "web3";
import contractABI from "./contractABI.json";
import "./App.css"; // Import CSS

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState("");
  const [contractAddress, setContractAddress] = useState("0x1aaed6e4397b8142d5b563be20e332f01e5e8935");

  const [balanceDetails, setBalanceDetails] = useState({ balance: "", time: "", hash: "" });
  const [transferDetails, setTransferDetails] = useState({ hash: "", time: "" });
  const [approveDetails, setApproveDetails] = useState({ hash: "", time: "" });
  const [transferFromDetails, setTransferFromDetails] = useState({ hash: "", time: "" });

  const [senderAddress, setSenderAddress] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [spenderAddress, setSpenderAddress] = useState("");
  const [transferAmount, setTransferAmount] = useState("");

  const contract = web3 && new web3.eth.Contract(contractABI, contractAddress);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3Instance.eth.getAccounts();
        setWeb3(web3Instance);
        setAccount(accounts[0]);
        setSenderAddress(accounts[0]);
        console.log("Wallet connected:", accounts[0]);
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    } else {
      console.error("MetaMask is not installed!");
    }
  };

  const disconnectWallet = () => {
    setWeb3(null);
    setAccount("");
    setSenderAddress("");
    console.log("Wallet disconnected.");
  };

  const measureBalanceOf = async () => {
    if (contract && senderAddress) {
      try {
        console.log("Checking Balance...");
        const startTime = Date.now();
        const balance = await contract.methods.balanceOf(senderAddress).call();
        const endTime = Date.now();
        setBalanceDetails({
          balance,
          time: `Response Time (balanceOf): ${endTime - startTime} ms`,
          hash: "N/A (read-only)",
        });
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    }
  };

  const measureTransfer = async () => {
    if (contract && account && senderAddress && receiverAddress && transferAmount) {
      try {
        console.log("Transferring Tokens...");
        const txStartTime = Date.now();
        const receipt = await contract.methods
          .transfer(receiverAddress, transferAmount)
          .send({ from: senderAddress });
        const txEndTime = Date.now();
        setTransferDetails({
          hash: receipt.transactionHash,
          time: `Transaction Time (Transfer): ${txEndTime - txStartTime} ms`,
        });
      } catch (error) {
        console.error("Error transferring tokens:", error);
      }
    }
  };

  const measureApprove = async () => {
    if (spenderAddress && transferAmount) {
      try {
        console.log("Approving spender...");
        const txStartTime = Date.now();
        const receipt = await contract.methods
          .approve(spenderAddress, transferAmount)
          .send({ from: senderAddress });
        const txEndTime = Date.now();
        setApproveDetails({
          hash: receipt.transactionHash,
          time: `Transaction Time (Approve): ${txEndTime - txStartTime} ms`,
        });
      } catch (error) {
        console.error("Error approving spender:", error);
      }
    }
  };

  const measureTransferFrom = async () => {
    if (contract && senderAddress && spenderAddress && receiverAddress && transferAmount) {
      try {
        console.log("Executing TransferFrom...");
        const txStartTime = Date.now();
        const receipt = await contract.methods
          .transferFrom(spenderAddress, receiverAddress, transferAmount)
          .send({ from: senderAddress });
        const txEndTime = Date.now();
        setTransferFromDetails({
          hash: receipt.transactionHash,
          time: `Transaction Time (TransferFrom): ${txEndTime - txStartTime} ms`,
        });
      } catch (error) {
        console.error("Error executing TransferFrom:", error);
      }
    }
  };

  return (
    <div className="container">
      <h1>Measuring the Latency of D-DOS Attack Token</h1>
      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <>
          <button onClick={disconnectWallet} className="disconnect-button">Disconnect Wallet</button>
          <div className="form-group">
            <label>Receiver Address:</label>
            <input
              type="text"
              value={receiverAddress}
              onChange={(e) => setReceiverAddress(e.target.value)}
              placeholder="Enter receiver address"
            />
            <label>Spender Address (for Approve or TransferFrom):</label>
            <input
              type="text"
              value={spenderAddress}
              onChange={(e) => setSpenderAddress(e.target.value)}
              placeholder="Enter spender address"
            />
            <label>Amount (Tokens):</label>
            <input
              type="number"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              placeholder="Enter amount"
            />
          </div>

          <div className="buttons">
            <button onClick={measureBalanceOf}>Check Balance</button>
            <button onClick={measureTransfer}>Transfer Tokens</button>
            <button onClick={measureApprove}>Approve Spender</button>
            <button onClick={measureTransferFrom}>Transfer From</button>
          </div>
        </>
      )}

      <div className="results">
        <h2>Results:</h2>
        <div>
          <h3>Check Balance:</h3>
          <p>Balance: {balanceDetails.balance}</p>
          <p>Time: {balanceDetails.time}</p>
          <p>Hash: {balanceDetails.hash}</p>
        </div>
        <div>
          <h3>Transfer Tokens:</h3>
          <p>Hash: {transferDetails.hash}</p>
          <p>Time: {transferDetails.time}</p>
        </div>
        <div>
          <h3>Approve Spender:</h3>
          <p>Hash: {approveDetails.hash}</p>
          <p>Time: {approveDetails.time}</p>
        </div>
        <div>
          <h3>Transfer From:</h3>
          <p>Hash: {transferFromDetails.hash}</p>
          <p>Time: {transferFromDetails.time}</p>
        </div>
      </div>
    </div>
  );
};

export default App;