import Web3 from "web3"; // Modern import for web3
import dotenv from "dotenv"; // Import dotenv for environment variables
import contractABI from '../ddos-attack/src/contractABI.json' assert { type: "json" };

dotenv.config(); // Load environment variables

// Connect to Avalanche Fuji Testnet
const web3 = new Web3("https://api.avax-test.network/ext/bc/C/rpc");

// Contract details
const contractAddress = "0x1aaed6e4397b8142d5b563be20e332f01e5e8935";
const contract = new web3.eth.Contract(contractABI, contractAddress);

// Wallet details
const senderAddress = "0x2E6C2eee6f954c71d2c2955544973dA6Ba8B09c6";
const privateKey = process.env.PRIVATE_KEY;
const receiverAddress = "0x5b61A4C1a86a4CBAc5b31909282A3495FE145bBE";

// Throughput parameters
const transactionsToSend = 100;
let successfulTransactions = 0;

// Function to send a transaction
const sendTransaction = async (amount, nonce) => {
  const tx = {
    from: senderAddress,
    to: contractAddress,
    gas: 3000000,
    maxPriorityFeePerGas: web3.utils.toWei('2', 'gwei'), // Define maxPriorityFeePerGas
    maxFeePerGas: web3.utils.toWei('50', 'gwei'), // Define maxFeePerGas
    data: contract.methods.transfer(receiverAddress, amount).encodeABI(),
    nonce: nonce, // Use the current nonce
  };

  // Sign the transaction
  const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);

  // Send the signed transaction
  return web3.eth.sendSignedTransaction(signedTx.rawTransaction);
};

// Measure throughput
const measureThroughput = async () => {
  console.log("Starting Throughput Test...");
  const startTime = Date.now();

  // Get the current nonce for the sender address
  let nonce = await web3.eth.getTransactionCount(senderAddress, "pending");

  const promises = [];
  for (let i = 0; i < transactionsToSend; i++) {
    promises.push(
      sendTransaction(1, nonce++) // Increment nonce for each transaction
        .then(() => successfulTransactions++)
        .catch((error) => console.error("Transaction Failed:", error))
    );
  }

  await Promise.all(promises);

  const endTime = Date.now();
  const totalTimeInSeconds = (endTime - startTime) / 1000;
  const throughput = successfulTransactions / totalTimeInSeconds;

  console.log(`Total Transactions Sent: ${transactionsToSend}`);
  console.log(`Successful Transactions: ${successfulTransactions}`);
  console.log(`Total Time Taken: ${totalTimeInSeconds.toFixed(2)} seconds`);
  console.log(`Throughput (TPS): ${throughput.toFixed(2)} transactions per second`);
};

measureThroughput();
