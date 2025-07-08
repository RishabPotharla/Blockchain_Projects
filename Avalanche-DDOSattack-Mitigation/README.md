🚀 Enhancing Blockchain Resilience: TCP/IP-Based Mitigation of DDoS Attacks on Avalanche
This project demonstrates a real-world simulation of low-fee transaction flooding attacks on the Avalanche blockchain, and implements a manual smart contract-based mitigation strategy. The project evaluates Avalanche’s performance under attack and presents an effective way to block malicious accounts through a custom token smart contract.

🔗 YouTube Video Demonstration
👉 https://youtu.be/Mx7oAp4hv6s

📁 Folder Structure

Folder Name	Description
ddos-attack/	React frontend connected to the original DDoS Attack Token smart contract (no mitigation).
final/	Final React frontend integrated with the enhanced smart contract for real-time mitigation.
solidity -1/	Initial version of the smart contract without mitigation.
solidity - 2/	Enhanced smart contract with account blocking/unblocking logic.
Attack/	Scripts to simulate transaction flooding using Ethers.js from attacker wallets.
realAttack/	Additional scripts for launching attacks with more intensity.
throughput/	Scripts to measure Avalanche’s network throughput before and after attack.
Wallet-1 DDOs attack/	First attacker wallet project used in simulation.
Wallet-2 DDOs attack/	Second attacker wallet project used in simulation.

🛠️ Features

✅ Launches DDoS-style low-gas transaction attacks.
✅ Tracks network latency, throughput, and failed transaction rate.
✅ Custom ERC-20 smart contract deployed to Avalanche Fuji Testnet.
✅ Manual blockAccount and unblockAccount functions for admins.
✅ Frontend admin interface for blocking and monitoring users.

⚙️ Setup Instructions
This project runs using React.js, Ethers.js, and MetaMask.

🔐 .env File Setup
For security reasons, .env files have been excluded from the repository. You must create your own .env files in the following folders:

Add a .env file with this content inside each of these folders:

ini
Copy
Edit
PRIVATE_KEY=your_private_key_here
Folder Path	Description
throughput/	Used to send measurement transactions
Wallet-1 DDOs attack/	First attack wallet
Wallet-2 DDOs attack/	Second attack wallet

Replace your_private_key_here with the actual private key of the corresponding wallet used in the simulation.

Clone the Repository

bash
Copy
Edit
git clone https://github.com/RishabPotharla/Blockchain_Projects.git
cd Blockchain_Projects/Avalanche-DDOS-Mitigation
Install Frontend Dependencies

bash
Copy
Edit
# For frontend with mitigation
cd final/vite-project
npm install

# OR for frontend without mitigation
cd ddos-attack
npm install
Start the Frontend

bash
Copy
Edit
npm start
Make sure MetaMask is configured to the Avalanche Fuji Testnet and you have test AVAX from the faucet.

🔐 Smart Contracts

Contract File	Description
smartcontract.sol	Original ERC-20 token without any mitigation logic. All accounts can send transactions freely.
smartcontractFixed.sol	Enhanced contract that includes manual account blocking/unblocking. Protects against flooding attacks.

🔑 Deployed Contract Addresses

🛡️ Enhanced (Mitigation)
0xEED3bdE194c1D8b60E2c95BEcD729D4FC35b8e90

⚠️ Original (Vulnerable)
0x1aaed6e4397b8142d5b563be20e332f01e5e8935

📊 Performance Evaluation

Scenario	Latency	Throughput	Failed Transactions
Before Attack	✅ Low	✅ High	❌ None
During Attack	⚠️ Increased	⚠️ Decreased	⚠️ Many
With Mitigation	✅ Stable	✅ Improved	✅ Reduced

📚 Use Cases

Security testing of Avalanche-based DApps

Educational demonstration of smart contract security

Benchmarking blockchain resilience under DDoS stress

👨‍💻 Author
Rishab Potharla
MSc Blockchain Technology, Atlantic Technological University
Supervisor: Gary Cullen
