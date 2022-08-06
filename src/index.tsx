import React from 'react';
import ReactDOM from 'react-dom/client';
import { Routes, Route, HashRouter } from 'react-router-dom';
import { CssBaseline, GeistProvider } from '@geist-ui/core';
import * as Sentry from '@sentry/electron/renderer';

import './index.css';

import Editor from './editor/Editor';
import ProjectSelector from './startScreen/ProjectSelector';
import Setting from './startScreen/Setting';
import ProjectOpen from './startScreen/ProjectOpen';

Sentry.init({ dsn: 'https://639261e8fe5846fa8d3a4e78131d5f64@o367548.ingest.sentry.io/6425628' });

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <GeistProvider>
            <CssBaseline />
            <HashRouter>
                <Routes>
                    <Route path="/editor" element={<Editor />} />
                    <Route path="/" element={<ProjectSelector children={<ProjectOpen />} />} />
                    <Route path="/settings" element={<ProjectSelector children={<Setting />} />} />
                </Routes>
            </HashRouter>
        </GeistProvider>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();
