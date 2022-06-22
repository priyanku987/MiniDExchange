/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import 'antd/dist/antd.css';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Dashboard from './views/Dashboard';

const SIDE = {
  BUY: 0,
  SELL: 1,
};

function App({ web3, accounts, contracts }) {
  const [tokens, setTokens] = useState([]);
  const [user, setUser] = useState({
    accounts: [],
    balances: {
      tokenDex: 0,
      tokenWallet: 0,
    },
    selectedToken: undefined,
  });
  const [orders, setOrders] = useState({
    buy: [],
    sell: [],
  });
  const [trades, setTrades] = useState([]);
  const [listener, setListener] = useState(undefined);
  const [fetchingBalances, setFetchingBalances] = useState(false);

  const getBalances = async (account, token) => {
    setFetchingBalances(true);
    console.log('token ticker', token.ticker);
    const tokenDex = await contracts.dex.methods
      .trader_balances(account, web3.utils.fromAscii(token.ticker))
      .call();

    console.log('tokenDex', tokenDex);

    console.log('con', contracts);

    console.log('Token calling', token);
    const tokenWallet = await contracts[token?.ticker].methods
      .balanceOf(account)
      .call();
    console.log('Token wallet', tokenWallet);
    setFetchingBalances(false);

    return {
      tokenDex,
      tokenWallet,
    };
  };

  const getOrders = async token => {
    const _orders = await Promise.all([
      contracts.dex.methods
        .get_orders(web3.utils.fromAscii(token.ticker), SIDE.BUY)
        .call(),
      contracts.dex.methods
        .get_orders(web3.utils.fromAscii(token.ticker), SIDE.SELL)
        .call(),
    ]);

    return { buy: _orders[0], sell: _orders[1] };
  };

  const listenToTrades = token => {
    const tradeIds = new Set();
    setTrades([]);
    const _listener = contracts.dex.events
      .New_Trade({
        filter: { ticker: web3.utils.fromAscii(token.ticker) },
        fromBlock: 0,
      })
      .on('data', newTrade => {
        console.log('newTrades', newTrade);
        if (tradeIds.has(newTrade.returnValues.trade_id)) return;
        tradeIds.add(newTrade.returnValues.trade_id);
        setTrades(_trades => [..._trades, newTrade.returnValues]);
      });
    setListener(_listener);
  };

  console.log('trades', trades);

  const selectToken = async token => {
    const newBalances = await getBalances(accounts[0], token);
    // Need to call get balance
    setUser({ ...user, selectedToken: token, balances: newBalances });
  };

  const deposit = async amount => {
    // First approve Dex smart contract to spend the token
    await contracts[user.selectedToken.ticker].methods
      .approve(contracts.dex.options.address, amount)
      .send({ from: user.accounts[0] });
    await contracts.dex.methods
      .deposit(amount, web3.utils.fromAscii(user.selectedToken.ticker))
      .send({ from: user?.accounts[0] });
    const balances = await getBalances(user.accounts[0], user.selectedToken);
    setUser(_user => ({ ..._user, balances }));
  };

  const withdraw = async amount => {
    await contracts.dex.methods
      .withdraw(amount, web3.utils.fromAscii(user.selectedToken.ticker))
      .send({ from: user?.accounts[0] });
    const balances = await getBalances(user.accounts[0], user.selectedToken);
    setUser(_user => ({ ..._user, balances }));
  };

  const createMarketOrder = async (amount, side) => {
    await contracts.dex.methods
      .create_market_order(
        web3.utils.fromAscii(user?.selectedToken?.ticker),
        amount,
        side,
      )
      .send({ from: accounts[0] });

    const _orders = await getOrders(user?.selectedToken);
    setOrders(_orders);
  };

  const createLimitOrder = async (amount, price, side) => {
    await contracts.dex.methods
      .create_limit_order(
        web3.utils.fromAscii(user?.selectedToken?.ticker),
        amount,
        price,
        side,
      )
      .send({ from: accounts[0] });
    const _orders = await getOrders(user?.selectedToken);
    setOrders(_orders);
  };

  console.log('user', user);

  function generateTokenLogo(tokenTicker) {
    if (tokenTicker === 'ZRX') {
      return 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xE41d2489571d322189246DaFA5ebDe1F4699F498/logo.png';
    }
    if (tokenTicker === 'REP') {
      return 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x1985365e9f78359a9B6AD760e32412f4a445E862/logo.png';
    }
    if (tokenTicker === 'BAT') {
      return 'https://assets.coingecko.com/coins/images/677/thumb/basic-attention-token.png?1547034427';
    }
    if (tokenTicker === 'DAI') {
      return 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png';
    }
    return '';
  }

  useEffect(() => {
    const init = async () => {
      const rawTokens = await contracts.dex.methods.getTokens().call();
      console.log('raw tokens', rawTokens);
      const _tokens = rawTokens.map(token => ({
        ...token,
        ticker: web3.utils.hexToUtf8(token.ticker),
        logo: generateTokenLogo(web3.utils.hexToUtf8(token.ticker)),
      }));

      const [balances, _orders] = await Promise.all([
        getBalances(accounts[0], _tokens[0]),
        getOrders(_tokens[0]),
      ]);
      listenToTrades(_tokens[0]);
      setTokens(_tokens);
      setUser({
        accounts,
        selectedToken: _tokens[0],
        balances,
      });
      setOrders(_orders);
    };
    init();
  }, []);

  useEffect(
    () => {
      const init = async () => {
        const [balances, _orders] = await Promise.all([
          getBalances(accounts[0], user.selectedToken),
          getOrders(user.selectedToken),
        ]);
        listenToTrades(user.selectedToken);
        setUser(_user => ({
          ..._user,
          balances,
        }));
        console.log('orders', _orders);
        setOrders(_orders);
      };

      if (typeof user.selectedToken !== 'undefined') {
        init();
      }
    },
    [user.selectedToken],
    () => {
      listener.unsubscribe();
    },
  );

  if (typeof user.selectedToken === 'undefined') {
    return <>Loadding...</>;
  }
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route
            path="/"
            render={({ location }) => (
              <Dashboard
                contracts={contracts}
                tokens={tokens}
                user={user}
                selectToken={selectToken}
                deposit={deposit}
                withdraw={withdraw}
                createMarketOrder={createMarketOrder}
                createLimitOrder={createLimitOrder}
                orders={orders}
                fetchingBalances={fetchingBalances}
                trades={trades}
              />
            )}
          />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
