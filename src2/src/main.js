import React, {useState, useEffect} from 'react';
import { UseContext } from './context';
import {useHistory} from 'react-router-dom';
import './index.css';

function Main() {
    const history = useHistory();
    const {web3, Contract} = UseContext();
    const [name, setName] = useState();
    const [address, setAddress] = useState();
    sessionStorage.setItem("address", address);
    const [password, setPassword] = useState();
    const [Accounts, setAccounts] = useState([]);


    useEffect(() => {
        listAccounts()
    });

    async function listAccounts() {
        let Users = await web3.eth.getAccounts();
        Users[0] = "Выберите адрес:";
        setAccounts(Users);
    }
    
    async function logIn(e) {
        e.preventDefault();
        try {
            await web3.eth.personal.unlockAccount(address, password, 9999);
            web3.eth.defaultAccount = address;
            history.push('/account');
            alert("Вы авторизовались.");
        }
        catch(e) {
            alert(e);
        }
    }

    async function signUp(e) {
        e.preventDefault();
        const address = await web3.eth.personal.newAccount(password);
        const accounts = await web3.eth.getAccounts();
        await web3.eth.personal.unlockAccount(accounts[0], "123");
        try {
            await Contract.methods.createUser(address, name).send({from: accounts[0]});
            await web3.eth.sendTransaction({
                from: accounts[0],
                to: address,
                value: 50*10**18
            });
            listAccounts();
            alert(`Вы зарегистрировались, запомните ваш аккаунт: ${address}.`)
        }
        catch(e) {
            alert(e);
        }
    }

    return(<>
        <h3>Регистрация</h3>
        <form onSubmit={signUp}>
            <input required placeholder="Логин" onChange={(e)=>setName(e.target.value)}/><br/>
            <input required type="password" placeholder="Пароль" onChange={(e)=>setPassword(e.target.value)}/><br/>
            <button>Зарегистрироваться</button>
        </form><br/>
        
        <h3>Авторизация</h3>
        <form onSubmit={logIn}>
            <select onChange={(e)=>setAddress(e.target.value)}>
                {Accounts.map((arr, i)=><option key={i} value={String(arr)}>{arr}</option>)}
            </select>
            <input required type="password" placeholder="Пароль" onChange={(e)=>setPassword(e.target.value)}/>
            <button>Войти</button>
        </form>
    </>);
}

export default Main;