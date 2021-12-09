import React, { useState } from "react";
import {useHistory} from 'react-router-dom'
import { UseContext } from "../Contract/Context";


const Page_2 = () => {

    const {web3, Contract} = UseContext()
    const [login, setLogin] = useState('')
    const [password, setPassword] = useState('')
    const [address, setAddress] = useState()
    const history = useHistory()
    sessionStorage.setItem('login', login)
    sessionStorage.setItem('address', address)

    async function logInForInterface(e)  {
        e.preventDefault();
        try{

            const address = await Contract.methods.getAddr(login).call()
            await web3.eth.personal.unlockAccount(address, password, 0)
                web3.eth.defaultAccount = address
                setAddress(address)
                history.push('/Page_4')
            }

        catch(e) {
            alert(e)
            
        }

    }

        return (
            <>
            <h3> Login </h3>
            <input required placeholder='login' value={login} onChange={(e) => setLogin(e.target.value)}/>  <br/>
            <input required placeholder='password' type="password" value={password} onChange={(e) => setPassword(e.target.value)}/> <br/>
            <button onClick={logInForInterface}>Login</button>
            </>
        )


}

export default Page_2