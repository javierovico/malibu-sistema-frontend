import {Link} from 'react-router-dom';
import Routes, {routes as menus, TipoRuta} from './router';
import React, {useContext, useMemo} from "react";
//router
import {useLocation} from 'react-router-dom';
import {AiFillCaretDown} from 'react-icons/ai';

// zona de menus
import './App.css'
import {Dropdown, Layout, Menu, Breadcrumb, MenuProps} from 'antd';
import {Row, Col} from "antd";
import {AuthContext} from "./context/AuthProvider";
import {ItemType} from "antd/lib/menu/hooks/useItems";
import SignIn from "./container/SignIn/SignIn";

const {SubMenu} = Menu;
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
    const {search, pathname} = location
    // const menus = routes
    const {menuSelected} = useMenuSelected(pathname, menus);
    const {user, loggedIn, logOut} = useContext(AuthContext)
    const items = useMemo<ItemType[]>(()=>menus
        .filter(m=>!m.ocultarOpcion)
        .map(m => ({
            label: !m.hijos ? (<Link to={{pathname:m.link , search}}>{m.nombre}</Link>) : m.nombre,
            key: m.link,
            children: m.hijos && m.hijos.map((h) => ({
                label: (<Link to={{pathname:m.link + h.link, search}}>{h.nombre}</Link>),
                key: m.link + h.link
            }))
    })),[search])
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
                    {/*<SignIn/>*/}
                </div>
            </Content>
            <Footer style={{textAlign: 'center'}}>
                Malibu System ©2021 Created by javierovico@gmail.com
            </Footer>
        </Layout>
    );
}

export default App;
