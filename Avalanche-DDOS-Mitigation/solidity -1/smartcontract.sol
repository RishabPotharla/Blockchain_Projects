// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyToken {
    string public name = "D-DOS_Attack ";                           // Token name
    string public symbol = "DDOS";                                     // Token symbol
    uint8 public decimals = 18;                                      // Decimals for display
    uint256 public totalSupply;                                      // Total supply of the token

    mapping(address => uint256) private balances;      // Balances of each account
    mapping(address => mapping(address => uint256)) private allowances; // Allowances for spenders

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(uint256 _initialSupply) {
        totalSupply = _initialSupply * 10 ** uint256(decimals); // Set initial supply
        balances[msg.sender] = totalSupply; // Assign the initial supply to the contract deployer
        emit Transfer(address(0), msg.sender, totalSupply);
    }

    // Check balance of an account
    function balanceOf(address account) public view returns (uint256) {
        return balances[account];
    }

    // Transfer tokens to another account
    function transfer(address recipient, uint256 amount) public returns (bool) {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        balances[recipient] += amount;
        emit Transfer(msg.sender, recipient, amount);
        return true;
    }

    // Approve an allowance for a spender
    function approve(address spender, uint256 amount) public returns (bool) {
        allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    // Get the allowance for a spender
    function allowance(address owner, address spender) public view returns (uint256) {
        return allowances[owner][spender];
    }

    // Transfer tokens on behalf of the owner
    function transferFrom(address sender, address recipient, uint256 amount) public returns (bool) {
        require(balances[sender] >= amount, "Insufficient balance");
        require(allowances[sender][msg.sender] >= amount, "Allowance exceeded");
        balances[sender] -= amount;
        balances[recipient] += amount;
        allowances[sender][msg.sender] -= amount;
        emit Transfer(sender, recipient, amount);
        return true;
    }}
