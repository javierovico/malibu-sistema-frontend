import {AuthContext} from "../../context/AuthProvider";
import React, {useContext} from "react";

export default function Home(){
    const {user} = useContext(AuthContext);
    return <pre>{JSON.stringify(user, null, 4)}</pre>
}
