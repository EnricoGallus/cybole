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
import {SettingsManager} from "tauri-settings";

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

const settingsManager = new SettingsManager<SettingSchema>(
    { pathToCybop: '', projects: []},
    { // options
        fileName: 'cybole-settings',
    }
)
// checks whether the settings file exists and created it if not
// loads the settings if it exists
settingsManager.initialize().then(() => {
    // any key other than 'theme' and 'startFullscreen' will be invalid.
    // theme key will only accept 'dark' or 'light' as a value due to the generic.
    settingsManager.setCache('pathToCybop', '');
});

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
