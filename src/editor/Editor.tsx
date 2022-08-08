import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button, Grid, Page, Select, Spacer, Tree } from '@geist-ui/core';
import { TreeFile } from '@geist-ui/core/dist/tree';

import EditInXmlFormat from './EditInXmlFormat';
import EditInDataGridFormat from './EditInDataGridFormat';
import { FileResult } from '../@types/FileResult';
import React from 'react';

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
    const [editorType, setEditorType] = useState<string | string[]>(EditorType.XML);
    const [showEditType, setShowEditorType] = useState(false);
    const [files, setFiles] = useState<TreeFile[]>([]);
    const [content, setContent] = useState('');
    const [editorKey, setEditorKey] = useState('');

    const renderEditor = () => {
        if (editorType === EditorType.XML) {
            return <EditInXmlFormat key={editorKey} fileKey={editorKey} content={content} />;
        }

        if (editorType === EditorType.DATA_GRID) {
            return <EditInDataGridFormat key={editorKey} fileKey={editorKey} content={content} />;
        }

        throw new Error('Unknown EditorType');
    };

    const editorTypeChanged = (val: string | string[]) => {
        setEditorType(val);
    };

    const fileIsSelected = (item: string) => {
        window.electron.readFile(locationState.directory, item).then((result: FileResult) => {
            setShowEditorType(true);
            setEditorKey(result.fullPathToFile);
            setContent(result.content);
        });
    };
    useEffect(() => {
        window.electron.getFiles(locationState.directory).then(
            (result) => {
                const tree: TreeFile[] = [];
                tree.push(result);
                setFiles(tree);
            },
            (error: string) => {
                throw new Error(error);
            }
        );
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
                        <Tree value={files} onClick={fileIsSelected} />
                    </Grid>
                    <Grid xs={18}>{renderEditor()}</Grid>
                </Grid.Container>
            </Page.Content>
        </Page>
    );
};

export default Editor;
