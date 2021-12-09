import React, { useState } from "react";
import { Context } from "./Contract/Context";
import { Userlist } from "./Contract/Userlist";
import {BrowserRouter as Router} from "react-router-dom"
import Web3 from 'web3'
import Routers from './router'

const App = () => {
  const [web3] = useState (new Web3('http://127.0.0.1:8545'))
  const Addr = '0xe8232f43e3F4278710973BD000DA5679c6FE559f'
  const [Contract] = useState( new web3.eth.Contract(Userlist, Addr))

  return (
    <Router>
      <Context.Provider value={{web3,Contract}}>
        <Routers/>
      </Context.Provider>
    </Router>
  )
}



export default App;
