import React from 'react';
import Menu from './Menu'
import Setting from './Setting'
import Home from './Home'
import './App.css';
import {BrowserRouter, Route, Routes} from "react-router-dom";

function App() {
    return (
        <div className="App">
            <Menu/>
            <header className="App-header">
                <BrowserRouter>
                    <Routes>
                        <Route path='/' element={<Home />}></Route>
                        <Route path='/setting' element={<Setting/>}></Route>
                    </Routes>
                </BrowserRouter>
            </header>
        </div>
    );
}

export default App;
