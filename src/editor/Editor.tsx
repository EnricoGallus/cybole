import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {readDir, readTextFile, FileEntry} from '@tauri-apps/api/fs';

import EditInXmlFormat from './EditInXmlFormat';
import EditInDataGridFormat from './EditInDataGridFormat';
import TreeNode from "primereact/treenode";
import {Tree, TreeEventNodeParams} from "primereact/tree";
import {Dropdown, DropdownChangeParams} from "primereact/dropdown";
import {Button} from "primereact/button";
import React from 'react';

export enum EditorType {
    XML = '0',
    DATA_GRID = '1',
}

interface LocationStateType {
    name: string;
    path: string;
}

const Editor = () => {
    const location = useLocation();
    const navigator = useNavigate();
    const locationState = location.state as LocationStateType;
    const [editorType, setEditorType] = useState<string>('');
    const [fileSelected, setFileSelected] = useState(false);
    const [files, setFiles] = useState<TreeNode[]>([]);
    const [fileKey, setFileKey] = useState('');
    const [content, setContent] = useState('');

    const renderEditor = () => {
        if (editorType === EditorType.XML) {
            return (<React.Fragment><div className="col-12">
                <Dropdown value={editorType} options={editorTypeSelection} onChange={editorTypeChanged} />
            </div><EditInXmlFormat key={fileKey} fileKey={fileKey} content={content} stateChanger={setContent} /></React.Fragment>);
        }

        if (editorType === EditorType.DATA_GRID) {
            return (<React.Fragment><div className="col-12">
                <Dropdown value={editorType} options={editorTypeSelection} onChange={editorTypeChanged} />
            </div><EditInDataGridFormat key={fileKey} fileKey={fileKey} content={content} stateChanger={setContent} /></React.Fragment>);
        }
    };

    const editorTypeChanged = (event: DropdownChangeParams) => {
        setEditorType(event.value);
    };

    const fileIsSelected = (item: TreeEventNodeParams) => {
        readTextFile(item.node.data.path).then((content) => {
            setFileSelected(true)
            setEditorType(EditorType.DATA_GRID);
            setFileKey(item.node.data.path);
            setContent(content);
        })
    };

    const editorTypeSelection = [
        {label: 'XML', value: EditorType.XML},
        {label: 'DataTable', value: EditorType.DATA_GRID},
    ];

    const processEntries = (entries: FileEntry[], parent: TreeNode) => {
        for (const entry of entries) {
            if (entry.children) {
                let directory: TreeNode = {label: entry.name, selectable: false, children: []};
                parent.children?.push(directory)
                processEntries(entry.children, directory)
            } else {
                let file: TreeNode = {label: entry.name, selectable: true, data: { path: entry.path }};
                parent.children?.push(file)
            }
        }
    }

    useEffect(() => {
        readDir(locationState.path, {recursive: true})
            .then((files) => {
                let rootNode: TreeNode = {
                    key: 1,
                    label: locationState.name,
                    selectable: false,
                    leaf: true,
                    children: [],
                }
                processEntries(files, rootNode)
                setFiles([rootNode]);
            });
    }, [locationState.path]);

    return (
        <div>
            <div className="card">
                <h5>Editor</h5>
                <Button label="Back To Project Selection" className="p-button-secondary" onClick={() => navigator('/')} />
            </div>
            <div className="grid" id="editor">
                <div className="col-4">
                    <Tree value={files} selectionMode="single" onSelect={fileIsSelected} />
                </div>
                <div className="col-8">
                    {fileSelected && renderEditor()}
                </div>
            </div>
        </div>
    );
};

export default Editor;
