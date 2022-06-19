import {Button} from "antd";
import {useContext, useEffect, useMemo, useState} from "react";
import {AuthContext} from "../../context/AuthProvider";
import {useSearchParams} from "react-router-dom";

export default function Dummy2 () {
    const {user} = useContext(AuthContext)
    const [searchParams, setSearchParams] = useSearchParams();
    const [valor,setValor] = useState({hola:'SIII'})
    useEffect(()=>{
        console.log({valor})
    },[valor])
    useEffect(()=>{
        console.log("El usuario desde Dummy2",user)
    },[user])
    const click = () => {
        console.log("CLICK BUTTON")
        setSearchParams("hola=3",{replace:true})
    }
    return <>
        <Button onClick={click}>PUSH</Button>
    </>
}
