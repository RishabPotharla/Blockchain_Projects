// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract RefugeeCIDRegistry {
    // Store metadata CID for each refugee (wallet address)
    mapping(address => string) public cidOf;

    // Event emitted whenever a new CID is submitted
    event CIDSubmitted(address indexed refugee, string cid);

    // Submit or update the CID for the caller (refugee)
    function submitCID(string calldata cid) external {
        cidOf[msg.sender] = cid;
        emit CIDSubmitted(msg.sender, cid);
    }
}
