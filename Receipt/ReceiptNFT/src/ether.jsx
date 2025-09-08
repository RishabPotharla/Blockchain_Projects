import React, { useState } from 'react';
import { ethers } from 'ethers';

function Ether() {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [contractAddress, setContractAddress] = useState('YOUR_CONTRACT_ADDRESS');
  const [contractABI, setContractABI] = useState(YOUR_CONTRACT_ABI); // Replace with your contract's ABI

  const connectToEthereum = async () => {
    try {
      if (window.ethereum) {
        await window.ethereum.enable();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);

        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        setContract(contract);

        const accounts = await provider.listAccounts();
        setAccount(accounts[0]); // assuming you take the first account
      } else {
        console.error('Ethereum provider not found. Please install MetaMask or another Web3 extension.');
      }
    } catch (error) {
      console.error('Error connecting to Ethereum:', error);
    }
  };

  const modifyContract = async () => {
    try {
      // Example of calling a contract function that modifies state
      const result = await contract.someFunction(); // Replace with your contract function call

      console.log('Transaction result:', result);
      // Handle success or further actions based on result
    } catch (error) {
      console.error('Error modifying contract:', error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Ethereum Smart Contract Interaction</h1>
      <p>Connected Account: {account}</p>
      <button onClick={connectToEthereum}>Connect to Ethereum</button>
      <button onClick={modifyContract}>Modify Contract</button>
    </div>
  );
}

export default Ether;
