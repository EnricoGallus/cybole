import React, {useEffect, useState} from 'react';
import {Button} from "primereact/button";
import {InputText} from "primereact/inputtext";
import {get, set} from "tauri-settings";
import {sendNotification} from "@tauri-apps/api/notification";
import {open} from "@tauri-apps/api/dialog";

const Setting = () => {
    const [pathToCybop, setPathToCybop] = useState('');

    useEffect(() => {
        get<SettingSchema>('pathToCybop').then(value => setPathToCybop(value as string));
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
        set<SettingSchema>('pathToCybop', pathToCybop)
            .then(() => sendNotification('Settings successfully saved!'));

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
