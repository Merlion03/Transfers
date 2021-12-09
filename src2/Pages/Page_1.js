import React from "react";
import {useHistory} from 'react-router-dom'


const Page_1 = () => {

    const history = useHistory()

    async function perehod1() {
        history.push('/Page_2')
    }

    async function perehod2() {
        history.push('/Page_3')
    }

    return( 
        <>
        <button onClick={perehod1}>Login</button>
        <button onClick={perehod2}>SignUp</button>
        </>
    )
}
export default Page_1;