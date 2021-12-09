import React from "react"
import { Switch, Route} from 'react-router-dom'
import Page_1 from "./Pages/Page_1"
import Page_2 from "./Pages/Page_2"
import Page_3 from "./Pages/Page_3"
import Page_4 from "./Pages/Page_4"
import Page_5 from "./Pages/Page_5"

const Routers = () => {
    return (
        <Switch>
            <Route path='/' component={Page_1} exact />
            <Route path='/Page_1' component={Page_1} exact />
            <Route path='/Page_2' component={Page_2} exact />
            <Route path='/Page_3' component={Page_3} exact />
            <Route path='/Page_4' component={Page_4} exact />
            <Route path='/Page_5' component={Page_5} exact />
        </Switch>
    )
}

export default Routers