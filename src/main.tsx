import React from 'react';
import ReactDOM from 'react-dom/client';
import { Routes, Route, HashRouter } from 'react-router-dom';

import './index.css';
import 'primeicons/primeicons.css'
import 'primereact/resources/themes/bootstrap4-light-blue/theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeflex/primeflex.css'

import Editor from './editor/Editor';
import StartScreen from './startScreen/StartScreen';
import Setting from './startScreen/Setting';
import ProjectScreen from "./startScreen/ProjectScreen";

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
    <React.StrictMode>
        <HashRouter>
            <Routes>
                <Route path="/editor" element={<Editor />} />
                <Route path="/" element={<StartScreen children={<ProjectScreen />} />} />
                <Route path="/settings" element={<StartScreen children={<Setting />} />} />
            </Routes>
        </HashRouter>
    </React.StrictMode>
);
