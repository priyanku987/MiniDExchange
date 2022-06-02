// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Wallet {
    // Approvers are addresses that approves a transaction on the ethereum blockchain
    address[] public approvers;
    // Quorum is the minimum number of approvers required to approve a transaction
    uint256 public quorum;

    //Structure to represent a transfer
    struct Transfer {
        uint256 id;
        uint256 amount;
        address payable to;
        uint256 approvals; //amount of approvals recieved for this particular transaction
        bool sent;
    }
    Transfer[] public transfers;
    mapping(address => mapping(uint256 => bool)) public approvals;

    constructor(address[] memory _approvers, uint256 _quorum) public {
        approvers = _approvers;
        quorum = _quorum;
    }

    // Getter function to return the list of approvers
    function get_approvers() external view returns (address[] memory) {
        return approvers;
    }

    // Getter function to return the list of transfers
    function get_transfers() external view returns (Transfer[] memory) {
        return transfers;
    }

    //Function to create a transfer
    function create_transfer(uint256 amount, address payable to)
        external
        onlyApprover
    {
        transfers.push(Transfer(transfers.length, amount, to, 0, false));
    }

    function approve_transfer(uint256 id) external onlyApprover {
        //1. check whether the transfer has already being made
        require(
            transfers[id].sent == false,
            "This Transfer has already being done."
        );
        //2.Check whether the transfer has already being approved
        require(
            approvals[msg.sender][id] == false,
            "This Transfer has already being approved."
        );

        // If above condition does not staisfy then go ahead to create the transfer
        //1. Set the approval to true so that next time it cannot be approved
        approvals[msg.sender][id] = true;
        //2. increment the id of transfer
        transfers[id].approvals++;
        //3. If the quorum has been met, then proceed to transfer
        if (transfers[id].approvals >= quorum) {
            transfers[id].sent = true;
            address payable to = transfers[id].to;
            uint256 amount = transfers[id].amount;
            // Actually transfer the amount
            to.transfer(amount);
        }
    }

    // native way to recieve ether, this allows to recieve ether
    // this allows us to send a transaction of the smart contract with some ether in it
    // without targeting any function, and automatically this function will get triggered
    receive() external payable {}

    modifier onlyApprover() {
        bool allowed = false;
        for (uint256 i = 0; i < approvers.length; i++) {
            if (approvers[i] == msg.sender) {
                allowed = true;
            }
        }
        require(allowed == true, "Only Approver allowed");
        _;
    }
}
