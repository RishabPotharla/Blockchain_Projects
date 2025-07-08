import React, { useState } from 'react';
import axios from 'axios';
import Web3 from 'web3';
import { contractABI } from './abi';

const CONTRACT_ADDRESS = '0x36516561bc2a564b320fc7571c4d74c75e13d214';
const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET_API_KEY = import.meta.env.VITE_PINATA_SECRET_API_KEY;

export default function NFTForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [metadataURL, setMetadataURL] = useState('');
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const switchToSepolia = async () => {
    const sepoliaChainId = '0xaa36a7'; // 11155111 in hex
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: sepoliaChainId }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: sepoliaChainId,
              chainName: 'Sepolia Test Network',
              rpcUrls: ['https://rpc.sepolia.org'],
              nativeCurrency: {
                name: 'Sepolia ETH',
                symbol: 'ETH',
                decimals: 18,
              },
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !description || !image) {
      alert('Please fill all fields');
      return;
    }

    try {
      setStatus('Uploading image to IPFS...');
      const imageData = new FormData();
      imageData.append('file', image);

      const imageRes = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', imageData, {
        maxBodyLength: 'Infinity',
        headers: {
          'Content-Type': 'multipart/form-data',
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_API_KEY,
        },
      });

      const imageCID = imageRes.data.IpfsHash;
      const imageURI = `ipfs://${imageCID}`;

      const metadata = {
        name,
        description,
        image: imageURI,
      };

      setStatus('Uploading metadata to IPFS...');
      const metadataRes = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', metadata, {
        headers: {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_API_KEY,
        },
      });

      const metadataCID = metadataRes.data.IpfsHash;
      const finalURI = `ipfs://${metadataCID}`;
      setMetadataURL(finalURI);

      setStatus('Switching to Sepolia network...');
      if (!window.ethereum) return alert('Please install MetaMask');
      await switchToSepolia();

      setStatus('Connecting wallet and minting NFT...');
      const web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await web3.eth.getAccounts();

      const contract = new web3.eth.Contract(contractABI, CONTRACT_ADDRESS);
      await contract.methods
        .mintNFT(accounts[0], finalURI)
        .send({ from: accounts[0] });

      setStatus('✅ NFT minted successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. See console.');
      setStatus('❌ Error during upload or minting.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-md space-y-6">
        <h1 className="text-2xl font-bold text-center">Photo NFT minting by using Pinata as a IPFS storage</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3>Enter the name of the NFT :</h3>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <br />
          <h3>Enter the description of the NFT</h3>
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <br />
          <h3>Select the NFT file</h3>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border p-2 rounded-md"
          />
          {preview && <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-md" style={{ width: '650px', height: '650px' }} />}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            Upload to IPFS & Mint NFT
          </button>
        </form>

       <h2>- Rishab Potharla</h2>

        {metadataURL && (
          <div className="mt-4 p-4 bg-green-100 rounded-md text-center">
            <p className="font-medium">✅ Metadata Uploaded!</p>
            <a
              href={`https://gateway.pinata.cloud/ipfs/${metadataURL.replace('ipfs://', '')}`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-700 underline break-all"
            >
              {metadataURL}
            </a>
          </div>
        )}

        {status && <p className="text-sm text-gray-600 text-center">{status}</p>}
      </div>
    </div>
  );
}
