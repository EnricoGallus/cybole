import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button, Grid, Page, Select, Spacer } from '@geist-ui/core';
import {readDir, readTextFile, FileEntry} from '@tauri-apps/api/fs';

import EditInXmlFormat from './EditInXmlFormat';
import EditInDataGridFormat from './EditInDataGridFormat';
import TreeNode from "primereact/treenode";
import {Tree, TreeEventNodeParams} from "primereact/tree";

export enum EditorType {
    XML = '0',
    DATA_GRID = '1',
}

interface LocationStateType {
    directory: string;
}

const Editor = () => {
    const location = useLocation();
    const navigator = useNavigate();
    const locationState = location.state as LocationStateType;
    const [editorType, setEditorType] = useState<string>('');
    const [showEditType, setShowEditorType] = useState(false);
    const [files, setFiles] = useState<TreeNode[]>([]);
    const [fileKey, setFileKey] = useState('');
    const [content, setContent] = useState('');

    const renderEditor = () => {
        if (editorType === EditorType.XML) {
            return <EditInXmlFormat key={fileKey} fileKey={fileKey} content={content} />;
        }

        if (editorType === EditorType.DATA_GRID) {
            return <EditInDataGridFormat key={fileKey} fileKey={fileKey} content={content} />;
        }
    };

    const editorTypeChanged = (val: string | string[]) => {
        setEditorType(val as string);
    };

    const fileIsSelected = (item: TreeEventNodeParams) => {
        readTextFile(item.node.data.path).then((content) => {
            setShowEditorType(true)
            setEditorType(EditorType.XML);
            setFileKey(item.node.data.label);
            setContent(content);
        })

    };

    const processEntries = (entries: FileEntry[], parent: TreeNode) => {
        for (const entry of entries) {
            if (entry.children) {
                let directory: TreeNode = {label: entry.name, children: []};
                parent.children?.push(directory)
                processEntries(entry.children, directory)
            } else {
                let file: TreeNode = {label: entry.name, selectable: true, data: { path: entry.path }};
                parent.children?.push(file)
            }
        }
    }

    useEffect(() => {
        readDir(locationState.directory, {recursive: true})
            .then((files) => {
                let rootNode: TreeNode = {
                    key: 1,
                    label: locationState.directory,
                    selectable: false,
                    leaf: true,
                    children: [],
                }
                processEntries(files, rootNode)
                setFiles([rootNode]);
            });
    }, [locationState.directory]);

    return (
        <Page>
            <Page.Header>
                <h2>Editor</h2>
            </Page.Header>
            <Page.Content>
                <Grid.Container>
                    <Grid xs={12}>
                        <Button type="secondary" ghost onClick={() => navigator('/')}>
                            Back To Project Selection
                        </Button>
                    </Grid>
                    <Grid xs={showEditType ? 12 : 0}>
                        <Select value={editorType} onChange={editorTypeChanged}>
                            <Select.Option value="0">XML</Select.Option>
                            <Select.Option value="1">DataGrid</Select.Option>
                        </Select>
                    </Grid>
                </Grid.Container>
                <Spacer h={2} />
                <Grid.Container id="editor">
                    <Grid xs={6}>
                        <Tree value={files} selectionMode="single" onSelect={fileIsSelected} />
                    </Grid>
                    <Grid xs={18}>{renderEditor()}</Grid>
                </Grid.Container>
            </Page.Content>
        </Page>
    );
};

export default Editor;
