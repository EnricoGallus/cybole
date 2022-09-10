import React from 'react';
import { Link } from 'react-router-dom';
import {Button} from "primereact/button";

const Setting = () => (
    <div>
        <div className="card">
            <h5>Settings</h5>
            <Link to="/">
                <Button label="Back to Project Selection" className="p-button-secondary" />
            </Link>
        </div>


    </div>
);

export default Setting;
