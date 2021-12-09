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
    const [patternId, setPatternId] = useState({val:-1, callback: null});
    const [patterns, setPatterns] = useState([]);
    const [patternValues, setPatternValues] = useState([]);
    const address = sessionStorage.getItem("address");
    const [balance, setBalance] = useState();
    const [addressToBoost, setAddressToBoost] = useState();
    const [votingFinished, setVotingFinished] = useState();
    const [vote, setVote] = useState();

    useEffect(() => {
        async function listPatterns() {
            let Patterns = await Contract.methods.getPatterns().call();
            let patternNames = new Set();
            for (let i in Patterns) {
                patternNames.add((i, Patterns[i][0]));
            }
            patternNames = Array.from(patternNames);
            patternNames.splice(0, 0, "Шаблон не выбран");
            setPatterns(patternNames);
        }
        listPatterns();

        getBalance();

        checkVotingStatus()
    });

    useEffect(()=> {
        console.log(patternId);
        const {callback} = patternId;
        callback && callback();
    }, [patternId]);

    async function logOut() {
        web3.eth.personal.lockAccount(address);
        alert("Вы вышли из аккаунта.");
        history.push('/main');
    }

    async function getBalance(addr) {
        let balance = await Contract.methods.getBalance(address).call() / 10**18;
        setBalance(balance);
    }

    async function createTransfer(e) {
        e.preventDefault();
        try {
            if (patternId === -1) {
                await Contract.methods.createTransfer(addressTo, codeword, categoryId, description).send({from: address, value: value});
            }
            else {
                await Contract.methods.usePattern(patternId, addressTo, codeword, description).send({from: address, value: value});
            }
            const transferId = await Contract.methods.getTransferID().call();
            e.target.reset();
            getBalance();
            alert(`ID перевода: ${transferId}.`);
        }
        catch(e) {
            alert(e);
        }
    }

    async function confirmTransfer(e) {
        e.preventDefault();
        try {
            await Contract.methods.confirmTransfer(transferId, codeword).send({from: address});
            e.target.reset();
            getBalance();
            alert('Перевод принят.');
        }
        catch(e) {
            alert(e);
        }
    }

    async function cancelTransfer(e) {
        e.preventDefault();
        try {
            await Contract.methods.cancelTransfer(transferId).send({from: address});
            e.target.reset();
            getBalance();
            alert('Перевод отменён.');
        }
        catch(e) {
            alert(e);
        }
    }

    async function getPatternValues() {
        let Patterns = await Contract.methods.getPatterns().call();
        let patternValues = [];
        console.log(patternId["val"])
        for (let i in Patterns) {
            if (Patterns[i][0] === patterns[patternId["val"]+1]) {
                patternValues.push((Patterns[i][2]));
            }
        }
        setPatternValues(patternValues);
    }

    async function checkVotingStatus() {
        let finished = await Contract.methods.checkBoostOffer().call();
        const addressToBoost = await Contract.methods.getAddressTooBoost().call()
        if (addressToBoost === "0x0000000000000000000000000000000000000000") {
            finished = true;
        }
        setVotingFinished(finished);
        if (finished) {
            document.getElementById("yes").style.visibility = "hidden";
            document.getElementById("no").style.visibility = "hidden";
            document.getElementById("addressToBoost").disabled = false;
            document.getElementById("boost").disabled = false;
        }
        else {
            document.getElementById("yes").style.visibility = "visible";
            document.getElementById("no").style.visibility = "visible";
            document.getElementById("addressToBoost").disabled = true;
            document.getElementById("boost").disabled = true;
            const addressToBoost = await Contract.methods.getAddressTooBoost().call()
            setAddressToBoost(addressToBoost);
        }
        return finished;
    }

    async function createBoostOffer(e) {
		e.preventDefault();
		try{
			await Contract.methods.createBoostOffer(addressToBoost).send({from: address});
            const finished = checkVotingStatus();
            if (finished) {
                
            }
			e.target.reset();
			alert('Пользователь добавлен на голосование.');
		} catch(e) {
			alert(e);
		}
	}

    async function voting(e) {
        e.preventDefault();
        console.log(vote);
        try {
            if (vote === "yes") {
                await Contract.methods.voteYes().send({from: address});
                alert('Вы проголосовали "За"');
            }
            else {
                await Contract.methods.voteNo().send({from: address});
                alert('Вы проголосовали "Против"');
            }
            const finished = checkVotingStatus();
            if (finished) {
                alert("Голосование окончено.");
            }
        }
        catch(e) {
            alert(e);
        }
    }

    function test(e) {
        e.preventDefault();
        console.log(patternId)
        console.log(patternValues)
    }

    return(<>
        <p>Адрес: {address}<br/>
            Баланс: {balance} ETH<br/>
            <button onClick={logOut}>Выйти</button>
        </p>
        

        <h3>Переводы</h3>
        <p>Создать перевод</p>
        <form onSubmit={createTransfer}>
            <select onChange={(e) => setPatternId({val:e.target.value-1, callback: ()=>getPatternValues()})}>
                {patterns.map((name, i)=><option key={i} value={i}>{name}</option>)}
            </select><br/>
            {
                patternId["val"] === -1 ? null:
                <>Сумма: 
                {patternValues.map((value, i)=><button key={i} type="button" value={i}>{value/10**18} ETH</button>)}<br/></>
            }
            <input required placeholder="Адрес" onChange={(e)=>setAddressTo(e.target.value)}/><br/>
            {patternId["val"] === -1 ?  <><input required placeholder="Сумма" onChange={(e)=>setValue(e.target.value)}/><br/></>: null}
            <input required type="password" placeholder="Кодовое слово" onChange={(e)=>setCodeword(e.target.value)}/><br/>
            {patternId["val"] === -1 ? <><input required placeholder="id категории" onChange={(e) => setCategoryId(e.target.value)} /><br /></> : null}
            <input placeholder="Описание" onChange={(e)=>setDescription(e.target.value)}/><br/>
            <button>Отправить</button><br/>
        </form>

        <p>Принять перевод</p>
        <form onSubmit={confirmTransfer}>
            <input required placeholder="id перевода" onChange={(e)=>setTransferId(e.target.value)}/><br/>
            <input required type="password" placeholder="Кодовое слово" onChange={(e)=>setCodeword(e.target.value)}/><br/>
            <button>Принять</button><br/>
        </form>

        <p>Отменить перевод</p>
        <form onSubmit={cancelTransfer}>
            <input required placeholder="id перевода" onChange={(e)=>setTransferId(e.target.value)}/><br/>
            <button>Отменить</button><br/>
        </form>

        <form onSubmit={test}>
            <button>patternId</button>
        </form>


		<h3>Выдвижение пользователя в админы</h3>
        {votingFinished ? <>Сейчас не проводится никаких голосований</>: <>Проводится голосование по пользователю {addressToBoost}</>}
		<form onSubmit={createBoostOffer}>
			<input id="addressToBoost" required placeholder="Адрес пользователя" onChange={(e) => setAddressToBoost(e.target.value)}/>
			<button id="boost">Выдвинуть</button><br/>
		</form>
		<form onSubmit={voting}>
			<button id="yes"  value="yes" onClick={(e)=>setVote(e.target.value)}>За</button>
            <button id="no"  value="no" onClick={(e)=>setVote(e.target.value)}>Против</button><br/>
		</form>
    </>)
}

export default Account;