import React from 'react';
import ReactDOM from 'react-dom/client';
import { Routes, Route, HashRouter } from 'react-router-dom';

import './index.css';
import 'primeicons/primeicons.css'
import 'primereact/resources/themes/bootstrap4-light-blue/theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeflex/primeflex.css'

import Editor from './editor/Editor';
import ProjectSelector from './startScreen/ProjectSelector';
import Setting from './startScreen/Setting';
import ProjectOpen from './startScreen/ProjectOpen';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <HashRouter>
            <Routes>
                <Route path="/editor" element={<Editor />} />
                <Route path="/" element={<ProjectSelector children={<ProjectOpen />} />} />
                <Route path="/settings" element={<ProjectSelector children={<Setting />} />} />
            </Routes>
        </HashRouter>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();
