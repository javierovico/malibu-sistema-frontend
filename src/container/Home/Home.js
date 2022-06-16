import {AuthContext} from "../../context/AuthProvider";
import React, {useContext} from "react";

export default function Home(){
    const {user} = useContext(AuthContext);
    return (<>
        <h4>user: </h4>
        <pre>{JSON.stringify(user, null, 4)}</pre>
    </>)
}
