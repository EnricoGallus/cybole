import React, {useEffect, useState} from 'react';
import {Button} from "primereact/button";
import {InputText} from "primereact/inputtext";
import {selectInterpreter} from "../platform/files";
import persister from "../utils/persister";

const Setting = () => {
    const [pathToCybop, setPathToCybop] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        persister.get().get('pathToCybop').then(value => setPathToCybop(value))
            .catch(error => setError(String(error)));
    }, [])

    const selectPathToCybop = async () => {
        const selected = await selectInterpreter();

        if (selected !== null) {
            setPathToCybop(selected as string)
        }
    };

    const saveSettings = () => {
        persister.get().set('pathToCybop', pathToCybop)
            .then(() => setError(''))
            .catch(error => setError(String(error)));
    }

    return (
        <div className="card grid">
            <div className="col-12">
                <h5>Settings</h5>
                {error && <p role="alert">Could not access settings: {error}</p>}
            </div>
            <div className="col-12">
                <div className="field">
                    <label htmlFor="pathToCybop" className="block">Path to Cybop</label>
                    <InputText id="pathToCybop" className="block" value={pathToCybop as string} onClick={() => selectPathToCybop().catch(error => setError(String(error)))} />
                </div>
            </div>
            <div className="col-12">
                <Button id="saveSettings" onClick={saveSettings}>Save</Button>
            </div>
        </div>);
}

export default Setting;
