import React, { useState } from "react";
import {useHistory} from 'react-router-dom'
import { UseContext } from "../Contract/Context";


const Page_3 = () => {

    const {web3, Contract} = UseContext()
    const [login, setLogin] = useState('')
    const [password, setPassword] = useState('')
    const history = useHistory()
    sessionStorage.setItem('login', login)

    async function SignUpForInterface(e)  {
            e.preventDefault();
            const address = await web3.eth.personal.newAccount(password)
            const accounts = await web3.eth.personal.getAccounts()
            await web3.eth.personal.unlockAccount(accounts[0], "1", 11111110)
            try {
                Contract.methods.createUser(address, login, password).send({
                    from: accounts[0]
                })
                await web3.eth.sendTransaction({
                    from: accounts[0],
                    to: address,
                    value: 50 * (10**18)
                })
                web3.eth.defaultAccount = address
                alert('Аккаунт создан')
                history.push('/Page_1')
            
        }
        
        catch(e) {
            alert(e)
            alert('Аккаунт не создан')
        }

    }

        return (
            <>
            <h3> Registration </h3>
            <input required placeholder='Login' value={login} onChange={(e) => setLogin(e.target.value)}/>  <br/>
            <input required placeholder='password' type="password" value={password} onChange={(e) => setPassword(e.target.value)}/> <br/>
            <button onClick={SignUpForInterface}>SignUp</button>
            </>
        )


}


export default Page_3