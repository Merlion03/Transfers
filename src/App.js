import {useState} from 'react';
import Web3 from 'web3';
import {BrowserRouter as Router} from 'react-router-dom';
import {ABI} from './abi';
import {Context} from './context';
import Routers from './routers';

function App() {
  const [web3] = useState(new Web3('http://127.0.0.1:8545'));
  const Address ='0x4FE97eBFe5868FFB68f59C01B6669ce7ad8Ce8e2';
  const [Contract] = useState(new web3.eth.Contract(ABI, Address));
  
  return(
    <Router>
      <Context.Provider value={{web3,Contract}}>
        <Routers/>
      </Context.Provider>
    </Router>
  );
}

export default App;