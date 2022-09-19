import React, {useEffect, useState} from 'react';
import {Button} from "primereact/button";
import {InputText} from "primereact/inputtext";
import {open} from "@tauri-apps/api/dialog";
import persister from "../utils/persister";

const Setting = () => {
    const [pathToCybop, setPathToCybop] = useState('');

    useEffect(() => {
        persister.get().get('pathToCybop').then(value => setPathToCybop(value as string));
    }, [])

    const selectPathToCybop = async () => {
        const selected = await open({
            directory: false,
            multiple: false,
        });

        if (selected !== null) {
            setPathToCybop(selected as string)
        }
    };

    const saveSettings = () => {
        persister.get().set('pathToCybop', pathToCybop);
    }

    return (
        <div className="card grid">
            <div className="col-12">
                <h5>Settings</h5>
            </div>
            <div className="col-12">
                <div className="field">
                    <label htmlFor="pathToCybop" className="block">Path to Cybop</label>
                    <InputText id="pathToCybop" className="block" value={pathToCybop as string} onClick={selectPathToCybop} />
                </div>
            </div>
            <div className="col-12">
                <Button id="saveSettings" onClick={saveSettings}>Save</Button>
            </div>
        </div>);
}

export default Setting;
