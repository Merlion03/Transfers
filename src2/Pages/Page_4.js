import React, {useEffect, useState}  from "react"
import {useHistory} from 'react-router-dom'
import { UseContext } from "../Contract/Context";


const Page_4 = () => {
    const {web3, Contract} = UseContext()
    const history = useHistory()
    const login = sessionStorage.getItem('login')
    const address = sessionStorage.getItem('address')

    const [value, setValue] = useState()
    const [addressFrom, setAddressFrom] = useState()
    const [addressTo, setAddressTo] = useState()
    const [codeWord, setCodeWord] = useState()
    const [description, setDescription] = useState()
    const [balance, setBalance] = useState()
    const [pattern, setPattern] = useState()
    let [transferId, setTransferId] = useState() 
    const [addressToBoost, setAddressToBoost] = useState();
    const [votingFinished, setVotingFinished] = useState();
    const [vote, setVote] = useState();

    useEffect(() => {
        getBalance()
    }, 
    [])

    async function getBalance() {
        let balance = await Contract.methods.getBalance(address).call() / 10**18;
        setBalance(balance);
    }


    async function logOutForInterface()  {
        web3.eth.personal.lockAccount(address);
        alert("Вы вышли из аккаунта");
        history.push('/Page_1');
    }


    async function createTransfer(e) {
        e.preventDefault();
        try {
            await Contract.methods.createTransfer(addressTo, codeWord, description).send({from:address, value: value * (10**18)})
            const transferId = await Contract.methods.getTransferID().call();
            e.target.reset()
            alert(`ID перевода: ${transferId};
                   Кодовое слово: ${codeWord}`);
            getBalance()
        }
        catch(e) {
            alert(e + 'Ошибка в переводе')
        }
    }

    async function confirmTransfer(e) {
        e.preventDefault() 
        try {
            await Contract.methods.confirmTransfer(transferId, codeWord).send({from: address})
            e.target.reset()
            alert(`Перевод от пользователя ${address} принят`)
            getBalance()
        }
        catch(e) {
            alert(e + 'Ошибка в принятие')
        }
    }

    async function cancelTransfer(e) {
        e.preventDefault() 
        try {
            await Contract.methods.cancelTransfer(transferId).send({from: address})
            e.target.reset()
            alert(`Перевод ${transferId} отменён`)
            getBalance()
        }
        catch(e) {
            alert(e + ' Ошибка в отмене перевода')
        }
    }

    async function transferAmount(e) {
        e.preventDefault()
        try {
            let transfersId = await Contract.methods.getTransferID().call()
            alert(transfersId)
        }
        catch(e) {
            alert(e)
        }
    }
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                    //-Голосование-\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function checkVotingStatus() {
    let finished = await Contract.methods.checkAdminVotting().call();
    console.log(1)
    const addressToBoost = await Contract.methods.getAddressToBoost().call()
    console.log(2)
    if (addressToBoost === "0x0000000000000000000000000000000000000000") {
        finished = true;
        console.log(3)
    }
    setVotingFinished(finished);
    if (finished) {
        console.log(4)
        document.getElementById("yes").style.visibility = "hidden";
        document.getElementById("no").style.visibility = "hidden";
        document.getElementById("addressToBoost").disabled = false;
        document.getElementById("boost").disabled = false;
    }
    else {
        console.log(1)
        document.getElementById("yes").style.visibility = "visible";
        document.getElementById("no").style.visibility = "visible";
        document.getElementById("addressToBoost").disabled = true;
        document.getElementById("boost").disabled = true;
        const addressToBoost = await Contract.methods.getAddressToBoost().call()
        setAddressToBoost(addressToBoost);
    }
    return finished;
}

async function createBoostOffer(e) {
    e.preventDefault();
    try{
        console.log(1)
        await Contract.methods.startVotting(addressToBoost).send({from: address});
        console.log(2)
        const finished = checkVotingStatus();
        console.log(3)
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
    
    async function getHistoryTransaction(e) {
        e.preventDefault()
        try {
            let transfersId = await Contract.methods.getTransferID().call()
                
                for (let i = 0; i <= transfersId; i++) {
                    
                    const array = await Contract.methods.getTransfer(i).call()
                        
                        if (array[0] === address || array[1] === address) {
                            console.log(array)
                            
                        }

                }
            }
        catch(e) {
            alert(e)
        }
    }
    
        return (
            <>
            <h1>Login: {login}</h1>
            <h1>Address: {address}</h1>
            <h1>Баланс: {balance} ETH</h1>
            <button onClick={logOutForInterface}>LogOut</button><br/><br/><br/><br/><br/>


            <form onSubmit={createTransfer}> 
            <h2>Создать перевод денег.</h2> <br/>
            <input required placeholder='Адрес получателя' onChange={(e) => setAddressTo(e.target.value)}/> <br/>
            <input required placeholder='Сумма' onChange={(e) => setValue(e.target.value)}/><br/>
            <input required placeholder='Кодовое слово' onChange={(e) => setCodeWord(e.target.value)}/><br/>
            <input required placeholder='Описание' onChange={(e) => setDescription(e.target.value)}/><br/>
            <button>Отправить</button>
            </form>

            <form onSubmit={confirmTransfer}> 
            <h2>Принять перевод денег.</h2>
            <input required placeholder='Номер транзакции' onChange={(e) => setTransferId(e.target.value)}/>
            <input required placeholder='Кодовое слово' onChange={(e) => setCodeWord(e.target.value)}/>
            <button>Принять</button>
            </form>
            
            <form onSubmit={cancelTransfer}> 
            <h2>Отменить перевод денег.</h2>
            <input required placeholder='Номер транзакции' onChange={(e) => setTransferId(e.target.value)}/>
            <button>Отменить</button>
            </form>

            <form onSubmit={getHistoryTransaction}> 
            <h2>История транзакции.</h2>
            <button>Узнать</button><br/>
            </form>

            <form onSubmit={transferAmount}>
                <button>Количество переводов в системе</button>
            </form>


                <h3>Голосование на роль Администратора</h3>
        {votingFinished ? <>Сейчас не проводится никаких голосований</>: <>Проводится голосование по пользователю {addressToBoost}</>}
		<form onSubmit={createBoostOffer}>
			<input id="addressToBoost" required placeholder="Адрес пользователя" onChange={(e) => setAddressToBoost(e.target.value)}/>
			<button id="boost">Выдвинуть</button><br/>
		</form>
		<form onSubmit={voting}>
			<button id="yes"  value="yes" onClick={(e)=>setVote(e.target.value)}>За</button>
            <button id="no"  value="no" onClick={(e)=>setVote(e.target.value)}>Против</button><br/>
		</form>



            </>

        )


}

export default Page_4