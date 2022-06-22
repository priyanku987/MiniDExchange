/* eslint-disable no-underscore-dangle */
import { useState, useEffect } from 'react';
import { getWeb3, getContracts } from '../utils';
import App from '../App';

export default function LoadingContainer() {
  const [web3, setWeb3] = useState(undefined);
  const [accounts, setAccounts] = useState([]);
  const [contracts, setContracts] = useState(undefined);

  useEffect(() => {
    const init = async () => {
      const _web3 = await getWeb3();
      const _contracts = await getContracts(_web3);
      const _accounts = await _web3.eth.getAccounts();
      setWeb3(_web3);
      setContracts(_contracts);
      setAccounts(_accounts);
    };
    init();
  }, []);

  const isReady = () =>
    typeof web3 !== 'undefined' &&
    typeof contracts !== 'undefined' &&
    accounts.length > 0;

  if (!isReady()) {
    return <>Loading...</>;
  }
  return <App web3={web3} contracts={contracts} accounts={accounts} />;
}
