🚀 Enhancing Blockchain Resilience: TCP/IP-Based Mitigation of DDoS Attacks on Avalanche
This project demonstrates a real-world simulation of low-fee transaction flooding attacks on the Avalanche blockchain, and implements a manual smart contract-based mitigation strategy. The project evaluates Avalanche’s performance under attack and presents an effective way to block malicious accounts through a custom token smart contract.

🔗 YouTube Video Demonstration
👉 https://youtu.be/Mx7oAp4hv6s

📁 Folder Structure
Folder Name	Description
Attack/	Scripts to simulate transaction flooding using Ethers.js from attacker wallets.
ddos-attack/	React frontend connected to the original DDoS Attack Token smart contract (no mitigation).
realAttack/	Additional scripts for launching attacks with more intensity.
solidity -1/	Initial version of the smart contract without mitigation.
solidity - 2/	Enhanced smart contract with account blocking/unblocking logic.
throughput/	Scripts to measure Avalanche’s network throughput before and after attack.
final/	Final React frontend integrated with the enhanced smart contract for real-time mitigation.

🛠️ Features
✅ Launches DDoS-style low-gas transaction attacks.

✅ Tracks network latency, throughput, and failed transaction rate.

✅ Custom ERC-20 smart contract deployed to Avalanche Fuji Testnet.

✅ Manual blockAccount and unblockAccount functions for admins.

✅ Frontend admin interface for blocking and monitoring users.

⚙️ Setup Instructions
This project runs using React.js, Ethers.js, and MetaMask.

🔐 .env files were used during development (for storing private keys and API URLs) but have been removed for security. You will need to recreate your own .env files with appropriate environment variables if needed.

1. Clone the Repository
bash
Copy
Edit
git clone https://github.com/your-username/ddos-avalanche-mitigation.git
cd ddos-avalanche-mitigation
2. Install Frontend Dependencies
bash
Copy
Edit
cd final     # or use ddos-attack to test without mitigation
npm install
3. Start the Frontend
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
During Attack	⚠️ Slightly increased	⚠️ Decreased	⚠️ Many
With Mitigation	✅ Stable	✅ Improved	✅ Reduced

📚 Use Cases
Security testing of Avalanche-based DApps

Educational demonstration of smart contract security

Benchmarking blockchain resilience under DDoS stress

👨‍💻 Author
Rishab Potharla
MSc Blockchain Technology, Atlantic Technological University
Supervisor: Gary Cullen

📜 License
Licensed under the MIT License — feel free to fork, modify, and build on it.
