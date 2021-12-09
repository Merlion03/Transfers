import React from "react";
import { Switch, Route } from "react-router-dom";
import Main from "./main";
import Account from "./account";

function Routers() {
    return(
        <Switch>
            <Route path="/main" component={Main} exact/>
            <Route path="/account" component={Account} exact/>
            <Route path="/" component={Main} exact/>
        </Switch>
    );
}

export default Routers