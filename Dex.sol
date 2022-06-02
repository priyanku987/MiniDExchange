// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol";

contract Dex {
    //Type of limit order
    enum Side {
        BUY,
        SELL
    }

    //Describe the Token
    struct Token {
        bytes32 ticker; //The Symbol
        address token_address;
    }

    //Describe the order
    struct Order {
        uint256 id;
        Side side;
        bytes32 ticker;
        uint256 amount;
        uint256 filled; // how much of the amount is fulfilled already
        uint256 price;
        uint256 date;
    }

    //Collection of tokens
    mapping(bytes32 => Token) public tokens;
    //List of all the Tickers
    bytes32[] public token_list;
    //Special address having admin rights
    address public admin;
    mapping(address => mapping(bytes32 => uint256)) public trader_balances;

    //Order book
    // here uint is 0 it will be buy and vice versa
    // The Order[] will be sorted by price time priority
    //like buy orders: [50, 45, 44, 30]
    //sell orders: [60, 67, 70, 72]
    mapping(bytes32 => mapping(uint256 => Order[])) public order_book;
    uint256 public next_order_id;
    bytes32 constant DAI = bytes32("DAI");

    constructor() public {
        //Creator of the token
        admin = msg.sender;
    }

    //Function to add token to the chain
    function add_token(bytes32 ticker, address token_address)
        external
        onlyAdmin
    {
        tokens[ticker] = Token(ticker, token_address);
        token_list.push(ticker);
    }

    //Function to send tokens or deposit
    function deposit(uint256 amount, bytes32 ticker)
        external
        tokenExist(ticker)
    {
        //This transfers the tokens from the sender to this smart contract first
        IERC20(tokens[ticker].token_address).transferFrom(
            msg.sender,
            address(this),
            amount
        );
        //Increment the balance of the trader in the smart contract
        trader_balances[msg.sender][ticker] += amount;
    }

    // function to withdraw the tokens
    function withdraw(uint256 amount, bytes32 ticker)
        external
        tokenExist(ticker)
    {
        //make sure trader has enough tokens
        require(
            trader_balances[msg.sender][ticker] >= amount,
            "Insufficient Balance"
        );
        // If theere is sufficient balance, decrement the amount from this Smart contract for a particular trader
        trader_balances[msg.sender][ticker] -= amount;
        //Actually transfer the amount to particular address, in this case the sender itself
        //because this is a withdrawal!
        IERC20(tokens[ticker].token_address).transfer(msg.sender, amount);
    }

    //Fuction to create limit order
    function create_limit_order(
        bytes32 ticker,
        uint256 amount,
        uint256 price,
        Side side
    ) external tokenExist(ticker) {
        //Should not be able to Dai token, since its the base currency
        require(ticker != DAI, "Cannot trade DAI");

        //Check if trader has enough balance
        if (side == Side.SELL) {
            require(
                trader_balances[msg.sender][ticker] >= amount,
                "Insufficient Balance"
            );
        } else {
            //If this is a BUY ordr, make sure that trader has enough DAi
            require(
                trader_balances[msg.sender][DAI] >= amount * price,
                "DAI Balance too low"
            );
        }
        Order[] storage orders = order_book[ticker][uint256(side)];
        orders.push(
            Order(
                next_order_id,
                side,
                ticker,
                amount,
                0,
                price,
                block.timestamp
            )
        );
        uint256 i = orders.length - 1;

        // Implementing Bubble sort to sort the orders here
        while (i > 0) {
            if (side == Side.BUY && orders[i - 1].price > orders[i].price) {
                break;
            }
            if (side == Side.SELL && orders[i - 1].price < orders[i].price) {
                break;
            }
            Order memory order = orders[i - 1];
            orders[i - 1] = orders[i];
            orders[i] = order;
            i--;
        }
        next_order_id++;
    }

    modifier tokenExist(bytes32 ticker) {
        require(
            tokens[ticker].token_address != address(0),
            "Token doesnot exist"
        );
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only Admin");
        _;
    }
}
