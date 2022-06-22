// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Dex {
    using SafeMath for uint256;
    //Type of limit order
    enum Side {
        BUY,
        SELL
    }

    //Describe the Token
    struct Token {
        bytes32 ticker; //The Symbol of the Token
        address token_address;
    }

    //Describe the order
    struct Order {
        uint256 id;
        address trader;
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
    uint256 public next_trade_id;
    bytes32 constant DAI = bytes32("DAI");

    //Describe a trade event, since output of a market match is a trade event
    event New_Trade(
        uint256 trade_id,
        uint256 order_id,
        bytes32 indexed ticker,
        address indexed trader_1,
        address indexed trader_2,
        uint256 amount,
        uint256 price,
        uint256 date
    );

    constructor() public {
        //Creator of the token
        admin = msg.sender;
    }

    //function to get the orders
    function get_orders(bytes32 ticker, Side side)
        external
        view
        returns (Order[] memory)
    {
        return order_book[ticker][uint256(side)];
    }

    function getTokens() external view returns (Token[] memory) {
        Token[] memory _tokens = new Token[](token_list.length);
        for (uint256 i = 0; i < token_list.length; i++) {
            _tokens[i] = Token(
                tokens[token_list[i]].ticker,
                tokens[token_list[i]].token_address
            );
        }
        return _tokens;
    }

    //Function to add token to the exchange
    // this is kind of a liquidity pool
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
        trader_balances[msg.sender][ticker] = trader_balances[msg.sender][
            ticker
        ].add(amount);
    }

    // Function to withdraw the tokens
    function withdraw(uint256 amount, bytes32 ticker)
        external
        tokenExist(ticker)
    {
        // make sure trader has enough tokens
        require(
            trader_balances[msg.sender][ticker] >= amount,
            "Insufficient Balance"
        );
        // If theere is sufficient balance, decrement the amount from this Smart contract for a particular trader
        trader_balances[msg.sender][ticker] = trader_balances[msg.sender][
            ticker
        ].sub(amount);
        // Actually transfer the amount to particular address, in this case the sender itself
        // because this is a withdrawal!
        IERC20(tokens[ticker].token_address).transfer(msg.sender, amount);
    }

    //Fuction to create limit order
    // Alows a trader to buy or sell tokens in this smart contract
    function create_limit_order(
        bytes32 ticker,
        uint256 amount,
        uint256 price,
        Side side
    ) external tokenExist(ticker) tokenIsNotDai(ticker) {
        //Check if trader has enough balance
        if (side == Side.SELL) {
            require(
                trader_balances[msg.sender][ticker] >= amount,
                "Insufficient Balance"
            );
        } else {
            //If this is a BUY ordr, make sure that trader has enough DAi
            require(
                trader_balances[msg.sender][DAI] >= amount.mul(price),
                "DAI Balance too low"
            );
        }
        Order[] storage orders = order_book[ticker][uint256(side)];
        orders.push(
            Order(
                next_order_id,
                msg.sender,
                side,
                ticker,
                amount,
                0,
                price,
                block.timestamp
            )
        );

        uint256 i = orders.length > 0 ? orders.length - 1 : 0;
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
            i = i.sub(1);
        }
        next_order_id = next_order_id.add(1);
    }

    // Function to create a BUY or SELL market order
    // A market order is an order to buy or sell a token at the best available price within the market
    function create_market_order(
        bytes32 ticker,
        uint256 amount,
        Side side
    ) external tokenExist(ticker) tokenIsNotDai(ticker) {
        //Check if trader has enough balance
        if (side == Side.SELL) {
            require(
                trader_balances[msg.sender][ticker] >= amount,
                "Insufficient Balance"
            );
        }
        // Extracting the list of BUY order if its a SELL order, vice versa
        Order[] storage orders = order_book[ticker][
            uint256(side == Side.BUY ? Side.SELL : Side.BUY)
        ];
        uint256 i;
        uint256 remaining = amount; //initially the remaining amount will be the the whole amount filled by the marketsince the matching process has not started yet

        while (i < orders.length && remaining > 0) {
            // Finding the available liquidity of each order of the order book
            uint256 available = orders[i].amount.sub(orders[i].filled);

            // If remianing is greter than whats available for current iterated order
            // then take all the liquidity of this order, then what will be matched will the whats available
            // else the limit order is bigger than market order so market order will be matched totally
            uint256 matched = (remaining > available) ? available : remaining;
            remaining = remaining.sub(matched);
            orders[i].filled = orders[i].filled.add(matched);
            emit New_Trade(
                next_trade_id,
                orders[i].id,
                ticker,
                orders[i].trader,
                msg.sender,
                matched,
                orders[i].price,
                block.timestamp
            );
            if (side == Side.SELL) {
                // Since trader sellls his tokens, so decrementing his tokens
                trader_balances[msg.sender][ticker] = trader_balances[
                    msg.sender
                ][ticker].sub(matched);
                //Also amount of DAI will be increased
                trader_balances[msg.sender][DAI] = trader_balances[msg.sender][
                    DAI
                ].add(matched.mul(orders[i].price));

                // For trader on the other side of the trade, gonna recieve the tokens
                trader_balances[orders[i].trader][ticker] = trader_balances[
                    orders[i].trader
                ][ticker].add(matched);
                trader_balances[orders[i].trader][DAI] = trader_balances[
                    orders[i].trader
                ][DAI].sub(matched.mul(orders[i].price));
            }

            if (side == Side.BUY) {
                require(
                    trader_balances[msg.sender][DAI] >=
                        matched * orders[i].price,
                    "Insufficient DAI Tokens"
                );
                trader_balances[msg.sender][ticker] = trader_balances[
                    msg.sender
                ][ticker].add(matched);
                trader_balances[msg.sender][DAI] = trader_balances[msg.sender][
                    DAI
                ].sub(matched.mul(orders[i].price));
                trader_balances[orders[i].trader][ticker] = trader_balances[
                    orders[i].trader
                ][ticker].sub(matched);
                trader_balances[orders[i].trader][DAI] = trader_balances[
                    orders[i].trader
                ][DAI].add(matched.mul(orders[i].price));
            }
            next_trade_id = next_trade_id.add(1);
            i = i.add(1);
        }
        i = 0;
        // Loop over the order book, if find an filled order, remove it
        while (i < orders.length && orders[i].filled == orders[i].amount) {
            for (uint256 j = i; j < orders.length - 1; j++) {
                orders[j] = orders[j + 1];
            }
            orders.pop();
            i = i.add(1);
        }
    }

    modifier tokenIsNotDai(bytes32 ticker) {
        require(ticker != DAI, "Cannot trade DAI");
        _;
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
