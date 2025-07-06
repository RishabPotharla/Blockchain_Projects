// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyToken {
    string public name = "D-DOS_Attack";
    string public symbol = "DDOS";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    address public owner = 0x5b61A4C1a86a4CBAc5b31909282A3495FE145bBE;

    mapping(address => uint256) private balances;
    mapping(address => mapping(address => uint256)) private allowances;
    mapping(address => uint256) private consecutiveFailedTransactionCount; // Tracks consecutive failed transactions for each address
    mapping(address => uint256) private blockUntil; // Tracks the block time until an account is blocked
    mapping(address => bool) private manuallyBlockedAccounts; // Tracks accounts manually blocked by the owner

    uint256 public constant MAX_FAILED_TRANSACTIONS = 100; // Max allowed consecutive failed transactions
    uint256 public constant BLOCK_DURATION = 30 days; // Block duration

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event AccountBlocked(address indexed account, uint256 until);
    event AccountManuallyBlocked(address indexed account);
    event AccountManuallyUnblocked(address indexed account);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier notBlocked() {
        require(blockUntil[msg.sender] <= block.timestamp, "Your account is temporarily blocked");
        require(!manuallyBlockedAccounts[msg.sender], "Your account is manually blocked");
        _;
    }

    constructor(uint256 _initialSupply) {
        owner = msg.sender;
        totalSupply = _initialSupply * 10 ** uint256(decimals);
        balances[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }

    function balanceOf(address account) public view returns (uint256) {
        return balances[account];
    }

    function transfer(address recipient, uint256 amount) public notBlocked returns (bool) {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        balances[recipient] += amount;
        consecutiveFailedTransactionCount[msg.sender] = 0; // Reset failed transaction count on success
        emit Transfer(msg.sender, recipient, amount);
        return true;
    }

    function approve(address spender, uint256 amount) public notBlocked returns (bool) {
        allowances[msg.sender][spender] = amount;
        consecutiveFailedTransactionCount[msg.sender] = 0; // Reset failed transaction count on success
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function allowance(address spender) public view returns (uint256) {
        return allowances[owner][spender];
    }

    function transferFrom(address sender, address recipient, uint256 amount) public notBlocked returns (bool) {
        require(balances[sender] >= amount, "Insufficient balance");
        require(allowances[sender][msg.sender] >= amount, "Allowance exceeded");
        balances[sender] -= amount;
        balances[recipient] += amount;
        allowances[sender][msg.sender] -= amount;
        consecutiveFailedTransactionCount[sender] = 0; // Reset failed transaction count on success
        emit Transfer(sender, recipient, amount);
        return true;
    }

    function recordFailedTransaction(address account) external onlyOwner {
        consecutiveFailedTransactionCount[account] += 1;

        if (consecutiveFailedTransactionCount[account] >= MAX_FAILED_TRANSACTIONS) {
            blockUntil[account] = block.timestamp + BLOCK_DURATION;
            emit AccountBlocked(account, blockUntil[account]);
        }
    }

    function blockAccountManually(address account) external onlyOwner {
        manuallyBlockedAccounts[account] = true;
        emit AccountManuallyBlocked(account);
    }

    function unblockAccountManually(address account) external onlyOwner {
        manuallyBlockedAccounts[account] = false;
        emit AccountManuallyUnblocked(account);
    }

    function getFailedTransactionCount(address account) public view returns (uint256) {
        return consecutiveFailedTransactionCount[account];
    }

    function getBlockStatus(address account) public view returns (bool isBlocked, uint256 unblockTime, bool manuallyBlocked) {
        isBlocked = blockUntil[account] > block.timestamp;
        unblockTime = blockUntil[account];
        manuallyBlocked = manuallyBlockedAccounts[account];
        return (isBlocked || manuallyBlocked, unblockTime, manuallyBlocked);
    }
}
