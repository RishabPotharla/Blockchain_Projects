import React, { useState, useEffect } from "react";
import Web3 from "web3";
import contractABI from "./contractABI.json";
import "./App.css"; // Import the CSS file

const contractAddress = "0xEED3bdE194c1D8b60E2c95BEcD729D4FC35b8e90"; // Replace with your contract address

const MyTokenApp = () => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(0);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [adminAccount, setAdminAccount] = useState(""); // Separate state for Admin Functions input

  useEffect(() => {
    if (web3 && contract && account) {
      fetchBalance();
    }
  }, [web3, contract, account]);

  const connectWallet = async () => {
    if (!web3) {
      try {
        const web3Instance = new Web3(window.ethereum);
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        const contractInstance = new web3Instance.eth.Contract(contractABI, contractAddress);

        setWeb3(web3Instance);
        setContract(contractInstance);
        setAccount(accounts[0]);
        setStatus("Wallet connected");
      } catch (error) {
        console.error(error);
        setStatus("Error connecting wallet");
      }
    } else {
      setWeb3(null);
      setContract(null);
      setAccount(null);
      setStatus("Wallet disconnected");
    }
  };

  const fetchBalance = async () => {
    try {
      const balance = await contract.methods.balanceOf(account).call();
      setBalance(web3.utils.fromWei(balance, "ether"));
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const handleTransfer = async () => {
    try {
      setStatus("Processing transfer...");
      const gasEstimate = await contract.methods.transfer(recipient, web3.utils.toWei(amount, "ether")).estimateGas({ from: account });
      await contract.methods.transfer(recipient, web3.utils.toWei(amount, "ether")).send({ from: account, gas: gasEstimate });
      setStatus("Transfer successful");
      fetchBalance();
    } catch (error) {
      console.error("Error during transfer:", error);

      // Check for specific errors
      if (error.message.includes("Your account is temporarily blocked")) {
        setStatus("Your account is blocked because of 100 consecutive failed transactions for low gas fees.");
      } else {
        setStatus("Error during transfer");
      }
    }
  };

  const blockAccount = async (blockAddress) => {
    try {
      setStatus("Blocking account...");
      await contract.methods.blockAccountManually(blockAddress).send({ from: account });
      setStatus(`Account ${blockAddress} blocked successfully due to 100 consecutive failed transactions for low gas fees.`);
    } catch (error) {
      console.error("Error blocking account:", error);
      setStatus("Error blocking account");
    }
  };

  const unblockAccount = async (unblockAddress) => {
    try {
      setStatus("Unblocking account...");
      await contract.methods.unblockAccountManually(unblockAddress).send({ from: account });
      setStatus("The account is unblocked now, Cheers :)");
    } catch (error) {
      console.error("Error unblocking account:", error);
      setStatus("Error unblocking account");
    }
  };

  return (
    <div className="container">
      <h1>D-DOS Attack Token</h1>
      <h3>This smart contract functionality can mitigate low transaction flood attacks before they impact the Mempool.</h3>
      <button onClick={connectWallet}>{web3 ? "Disconnect Wallet" : "Connect Wallet"}</button>
      <p className={`status ${status.includes("Error") ? "error" : "success"}`}>{status}</p>
      {account && (
        <div>
          <p>Connected Account: {account}</p>
          <p>Balance: {balance} DDOS</p>
          <input
            type="text"
            placeholder="Recipient Address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)} // Transaction recipient state
          />
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)} // Amount state
          />
          <button onClick={handleTransfer}>Transfer</button>
        </div>
      )}
      <div>
        <h3>Admin Functions</h3>
        <input
          type="text"
          placeholder="Account to block/unblock"
          value={adminAccount}
          onChange={(e) => setAdminAccount(e.target.value)} // Admin account state
        />
        <button onClick={() => blockAccount(adminAccount)}>Block Account</button>
        <button onClick={() => unblockAccount(adminAccount)}>Unblock Account</button>
      </div>
    </div>
  );
};

export default MyTokenApp;
