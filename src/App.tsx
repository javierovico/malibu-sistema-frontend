import {Link} from 'react-router-dom';
import Routes, {routes as menus, TipoRuta} from './router';
import React, {useContext, useMemo} from "react";
//router
import {useLocation} from 'react-router-dom';
import {AiFillCaretDown} from 'react-icons/ai';

// zona de menus
import './App.css'
import {Dropdown, Layout, Menu, Breadcrumb, Modal, Button} from 'antd';
import {Row, Col} from "antd";
import {AuthContext} from "./context/AuthProvider";
import {ItemType} from "antd/lib/menu/hooks/useItems";
import {comprobarRol} from "./modelos/Usuario";
import ModificarProducto from "./container/Administracion/ModificarProducto";

const {Header, Content, Footer} = Layout;


function useMenuSelected(pathname: string, menus: TipoRuta[]) {
    const menuSelected = useMemo(() => {
        const pathDir = pathname.split('/').filter(r => r)
        const salida: string[] = []
        let menuActual = menus
        pathDir.forEach(p => {
            const menuEncontrado = menuActual.find(m => m.link === '/' + p)
            if (!menuEncontrado) {
                salida.push(p)
                menuActual = []
            } else {
                salida.push(menuEncontrado.nombre)
                menuActual = menuEncontrado.hijos || []
            }
        })
        return salida
    }, [menus, pathname])
    return {
        menuSelected
    }
}

function App() {
    const location = useLocation();
    const {pathname} = location     //TODO ver si se puede agregar opcionalmente el search de acuerdo al rotue
    // const menus = routes
    const {menuSelected} = useMenuSelected(pathname, menus);
    const {user, loggedIn, logOut, errorView, setError} = useContext(AuthContext)
    const items = useMemo<ItemType[]>(()=>{
        const funcionHijas = (basePath: string, m: TipoRuta): ItemType=> {
            const urlActual = basePath + m.link
            const innaccesible = (m.protected && (!user || !!(m.rolRequerido && !comprobarRol(user,m.rolRequerido))))
            const protegido = m.protected && !loggedIn
            return {
                label: !m.hijos ?
                    ((!innaccesible || protegido) ?
                        <Link to={{pathname:urlActual}}>{m.nombre}</Link>
                        : m.nombre
                    )
                    : m.nombre,
                key: urlActual,
                disabled: innaccesible && !protegido,
                children: m.hijos && m.hijos
                    .filter(i => !i.ocultarOpcion)
                    .map(i => funcionHijas(urlActual, i))
            }
        }
        return menus
            .filter(m=>!m.ocultarOpcion)
            .map( i => funcionHijas('',i))
    },[loggedIn, user])
    const itemsMenuUsuario = useMemo<ItemType[]>(()=>([{
        label: (<a target="_blank" rel="noopener noreferrer" href="https://www.antgroup.com" onClick={(e) => {
            e.preventDefault()
            logOut()
        }}>
            Cerrar Sesion
        </a>),
        key: 'cerrar-sesion'
    }]),[logOut])
    return (
        <Layout className="layout">
            <Header>
                <div className="logo"/>
                <Row justify="space-between">
                    <Col span={16}>
                        <Menu
                            theme="dark"
                            mode="horizontal"
                            selectedKeys={[pathname]}
                            items={items}
                        />
                    </Col>
                    <Col span={8}>
                        {loggedIn && user && <Dropdown overlay={<Menu items={itemsMenuUsuario}/>}>
                            <a href={'no'} className="ant-dropdown-link" onClick={e => e.preventDefault()}
                               style={{float: 'right'}}>
                                {user.user}<AiFillCaretDown/>
                            </a>
                        </Dropdown>}
                    </Col>
                </Row>
            </Header>
            <Content style={{padding: '0 50px'}}>
                <Breadcrumb style={{margin: '16px 0'}}>
                    <Breadcrumb.Item>Inicio</Breadcrumb.Item>
                    {
                        menuSelected.map(m => (<Breadcrumb.Item key={m}>{m}</Breadcrumb.Item>))
                    }
                </Breadcrumb>
                <div className="site-layout-content">
                    <Routes/>
                </div>
            </Content>
            <Footer style={{textAlign: 'center'}}>
                Malibu System ©2021 Created by javierovico@gmail.com
            </Footer>
            <Modal title={'Error'} visible={!!errorView} onOk={()=>setError()} onCancel={()=>setError()} footer={[<Button key='1' type="primary" onClick={()=>setError()}>Cerrar</Button>]} >
                {errorView}
            </Modal>
        </Layout>
    );
}

export default App;
