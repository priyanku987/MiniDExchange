import Web3 from 'web3';
import Dex from './contracts/Dex.json';
import ERC20Abi from './ERC20Abi.json';

const getWeb3 = () =>
  new Promise((resolve, reject) => {
    // Wait for loading completion to avoid race conditions with web3 injection timing.
    window.addEventListener('load', async () => {
      // Modern dapp browsers...
      if (window.ethereum) {
        console.log('Hello');
        console.log('ethereum window', window.ethereum);
        const web3 = new Web3(window.ethereum);
        console.log(web3);
        try {
          // Request account access if needed
          await window.ethereum.enable();
          // Acccounts now exposed
          resolve(web3);
        } catch (error) {
          reject(error);
        }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        // Use Mist/MetaMask's provider.
        const { web3 } = window;
        console.log('Injected web3 detected.');
        resolve(web3);
      }
      // Fallback to localhost; use dev console port by default...
      else {
        console.log('Kela');
        const provider = new Web3.providers.HttpProvider(
          'http://localhost:8545',
        );
        const web3 = new Web3(provider);
        console.log('No web3 instance injected, using Local web3.');
        resolve(web3);
      }
    });
  });

const getContracts = async web3 => {
  const networkId = await web3.eth.net.getId();

  console.log('networkId', networkId);
  console.log('dex networks', Dex.networks);
  const deployedNetwork = Dex.networks[networkId];
  console.log('deployed netwrok', deployedNetwork);
  const dex = new web3.eth.Contract(
    Dex.abi,
    deployedNetwork && deployedNetwork.address,
  );

  console.log('dex methods', dex.methods);

  const tokens = await dex.methods.getTokens().call();
  console.log('rawest tokens', tokens);
  const tokenContracts = tokens.reduce(
    (acc, token) => ({
      ...acc,
      [web3.utils.hexToUtf8(token.ticker)]: new web3.eth.Contract(
        ERC20Abi,
        token.token_address,
      ),
    }),
    {},
  );
  console.log('token contracts', tokenContracts);
  return { dex, ...tokenContracts };
};

export { getWeb3, getContracts };
