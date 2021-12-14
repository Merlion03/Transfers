import React, {useState, useEffect} from 'react';
import { UseContext } from './context';
import {useHistory} from 'react-router-dom';
import './index.css';

function Account() {
    const history = useHistory();
    const {web3, Contract} = UseContext();
    const [addressTo, setAddressTo] = useState();
    const [value, setValue] = useState();
    const [codeword, setCodeword] = useState();
    const [categoryId, setCategoryId] = useState();
    const [description, setDescription] = useState();
    const [transferId, setTransferId] = useState();
    const address = sessionStorage.getItem("address");
    const [balance, setBalance] = useState();
    const [addressToBoost, setAddressToBoost] = useState();
    const [votingStatus, setVotingStatus] = useState();
    const [vote, setVote] = useState();
    const [voted, setVoted] = useState();
    const [admin, setAdmin] = useState();
    const [categoryName, setCategoryName] = useState();
    const [patternName, setPatternName] = useState();
    const [patternValue, setPatternValue] = useState();

    useEffect(() => {
        async function isAdmin() {
            let admin = await Contract.methods.isAdmin().call({from: address});
            setAdmin(admin);
        }

        isAdmin();
        getBalance();
        checkVotingStatus();
    }, []);

    async function logOut() {
        web3.eth.personal.lockAccount(address);
        alert("Вы вышли из аккаунта.");
        history.push('/main');
    }

    async function getBalance() {
        let balance = await Contract.methods.getBalance(address).call() / 10**18;
        setBalance(balance);
    }

    async function isVoted() {
        let voted = await Contract.methods.isVoted().call({from: address});
        setVoted(voted);
    }

    async function createTransfer(e) {
        e.preventDefault();
        try {
            await Contract.methods.createTransfer(addressTo, codeword, categoryId, description).send({from: address, value: value});
            const transferId = await Contract.methods.getTransferID().call();
            getBalance();
            alert(`ID перевода: ${transferId}.`);
        }
        catch(e) {
            alert(e);
        }
        e.target.reset();
    }

    async function confirmTransfer(e) {
        e.preventDefault();
        try {
            await Contract.methods.confirmTransfer(transferId, codeword).send({from: address});
            getBalance();
            alert('Перевод принят.');
        }
        catch(e) {
            alert(e);
        }
        e.target.reset();
    }

    async function cancelTransfer(e) {
        e.preventDefault();
        try {
            await Contract.methods.cancelTransfer(transferId).send({from: address});
            getBalance();
            alert('Перевод отменён.');
        }
        catch(e) {
            alert(e);
        }
        e.target.reset();
    }

    async function checkVotingStatus() {
        const status = await Contract.methods.checkBoostOffer().call();
        if (status) {
            const addressToBoost = await Contract.methods.getAddressTooBoost().call();
            setAddressToBoost(addressToBoost);
        }
        setVotingStatus(status);
        isVoted();
        return status;
    }

    async function createBoostOffer(e) {
		e.preventDefault();
		try{
			await Contract.methods.createBoostOffer(addressToBoost).send({from: address});
            checkVotingStatus();
			alert('Пользователь добавлен на голосование.');
		} 
        catch(e) {
			alert(e);
		}
        e.target.reset();
	}

    async function voting(e) {
        e.preventDefault();
        try {
            if (vote === "yes") {
                await Contract.methods.voteYes().send({from: address});
                alert('Вы проголосовали "За"');
            }
            else {
                await Contract.methods.voteNo().send({from: address});
                alert('Вы проголосовали "Против"');
            }
            const status = checkVotingStatus();
            if (!status) {
                alert("Голосование окончено.");
            }
        }
        catch(e) {
            alert(e);
        }
    }

    async function createCategory(e) {
        e.preventDefault();
        try{
            await Contract.methods.createCategory(categoryName).send({from: address});
        }
        catch(e) {
            alert(e);
        }
        const categoryId = await Contract.methods.getCategoryId().call();
        alert(`Категория создана.\nid категории: ${categoryId}`);
        e.target.reset();
    }

    async function createPattern(e) {
        e.preventDefault();
        try{
            await Contract.methods.createPattern(patternName, categoryId, patternValue).send({from: address});
        }
        catch(e) {
            alert(e);
        }
        const patternId = await Contract.methods.getPatternId().call();
        alert(`Шаблон создан.\nid шаблона: ${patternId}`);
        e.target.reset();
    }

    return(<>
        <p>Адрес: {address}<br/>
            Баланс: {balance} ETH<br/>
            <button onClick={logOut}>Выйти</button>
        </p>
        

        <h3>Переводы</h3>
        Создать перевод
        <form onSubmit={createTransfer}>
            <input required placeholder="Адрес" onChange={(e)=>setAddressTo(e.target.value)}/><br/>
            <input required placeholder="Сумма" onChange={(e)=>setValue(e.target.value)}/><br/>
            <input required type="password" placeholder="Кодовое слово" onChange={(e)=>setCodeword(e.target.value)}/><br/>
            <input required placeholder="id категории" onChange={(e) => setCategoryId(e.target.value)} /><br />
            <input placeholder="Описание" onChange={(e)=>setDescription(e.target.value)}/><br/>
            <button>Отправить</button><br/>
        </form><br/>

        Принять перевод
        <form onSubmit={confirmTransfer}>
            <input required placeholder="id перевода" onChange={(e)=>setTransferId(e.target.value)}/><br/>
            <input required type="password" placeholder="Кодовое слово" onChange={(e)=>setCodeword(e.target.value)}/><br/>
            <button>Принять</button><br/>
        </form><br/>

        Отменить перевод
        <form onSubmit={cancelTransfer}>
            <input required placeholder="id перевода" onChange={(e)=>setTransferId(e.target.value)}/><br/>
            <button>Отменить</button><br/>
        </form>

        {
            admin ? <>
                <h3> Панель администратора</h3>
                {
                    votingStatus ? <>Проводится голосование по назначению администратором пользователя <br/>{addressToBoost}<br/>
                        {
                            voted ? <>Вы уже проголосовали<br/><br/></>:
                            <>
                                <form onSubmit={voting}>
                                <button id="yes"  value="yes" onClick={(e)=>setVote(e.target.value)}>За</button>
                                <button id="no"  value="no" onClick={(e)=>setVote(e.target.value)}>Против</button><br/>
                                </form><br/>
                            </>
                        }
                    </>: 
                    <>Голосование по назначению администратора сейчас не проводится<br/>
                        <form onSubmit={createBoostOffer}>
                            <input id="addressToBoost" required placeholder="Адрес пользователя" onChange={(e) => setAddressToBoost(e.target.value)}/>
                            <button id="boost">Выдвинуть</button><br/>
                        </form><br/>
                    </>
                }

                Создать категорию перевода
                <form onSubmit={createCategory}>
                    <input required placeholder='Название' onChange={(e)=>setCategoryName(e.target.value)}/>
                    <button>Создать</button>
                </form><br/>

                Создать шаблон перевода
                <form onSubmit={createPattern}>
                    <input required placeholder='Название' onChange={(e)=>setPatternName(e.target.value)}/><br/>
                    <input required placeholder='id категории' onChange={(e)=>setCategoryId(e.target.value)}/><br/>
                    <input required placeholder='Сумма' onChange={(e)=>setPatternValue(e.target.value)}/><br/>
                    <button>Создать</button>
                </form>
            </>: null
        }
    </>)
}

export default Account;
