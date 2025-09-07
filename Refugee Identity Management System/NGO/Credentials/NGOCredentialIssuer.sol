// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title NGOCredentialIssuer
/// @notice Owner (NGO) can issue credentials with the exact fields from your issuer UI.
/// @dev We emit events for indexing/analytics; no on-chain PII storage beyond the event itself.
contract NGOCredentialIssuer {
    address public owner;

    event CredentialIssued(
        address indexed issuer,
        address indexed refugee,   // "Refugee Wallet Address"
        string name,               // "Name"
        uint8 age,                 // "Age"
        string gender,             // "Gender"
        string credentialType,     // "Credential Type"
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender; // NGO deployer
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "zero addr");
        owner = newOwner;
    }

    /// @notice Issue credential with the exact UI fields.
    function issueCredential(
        address refugee,
        string calldata name,
        uint8 age,
        string calldata gender,
        string calldata credentialType
    ) external onlyOwner {
        require(refugee != address(0), "zero refugee");
        emit CredentialIssued(msg.sender, refugee, name, age, gender, credentialType, block.timestamp);
    }
}
