import {Link, useLocation} from "react-router-dom";
import {useEffect, useState} from "react";
import {Grid, Page, Radio, Tree} from "@geist-ui/core";
import {TreeFile} from "@geist-ui/core/dist/tree";

import EditInXmlFormat from "./EditInXmlFormat";
import EditInDataGridFormat from "./EditInDataGridFormat";

export enum EditorType {
    XML= "0",
    DATA_GRID = "1"
}

interface LocationStateType {
    directory: string
}

const Editor = () => {
    const location = useLocation();
    const locationState = location.state as LocationStateType;
    const [editorType, setEditorType] = useState<string | number>(EditorType.XML);
    const [files, setFiles] = useState<TreeFile[]>([]);
    const [content, setContent] = useState('');
    const [editorKey, setEditorKey] = useState('');

    const renderEditor = () => {
        if (editorType === EditorType.XML) {
            return <EditInXmlFormat key={editorKey} fileKey={editorKey} content={content} />
        }

        if (editorType === EditorType.DATA_GRID) {
            return <EditInDataGridFormat key={editorKey} fileKey={editorKey} content={content} />
        }

        throw new Error('Unknown EditorType');
    }

    const editorTypeChanged = (val: string | number) => {
        setEditorType(val);
    }

    const fileIsSelected = (item: string) => {
        window.electron.readFile(locationState.directory, item)
            .then((result: string) => {
                setEditorKey(item);
                setContent(result);
            });
    }
    useEffect(() => {
        window.electron.getFiles(locationState.directory).then(result => {
            const tree: TreeFile[] = [];
            tree.push(result);
            setFiles(tree);
        }, (error: string) => {
            throw new Error(error);
        });
    }, [locationState.directory]);

    return (
        <Page>
            <Grid.Container id="editor">
                <Grid xs={12}>
                    Editor
                </Grid>
                <Grid xs={12}>
                    <Link to="/" className="btn btn-primary">Back to ProjectSelection</Link>
                </Grid>
                <Grid xs={24}>
                    <Radio.Group value={editorType} onChange={editorTypeChanged}>
                        <Radio value="0">XML</Radio>
                        <Radio value="1">DataGrid</Radio>
                    </Radio.Group>
                </Grid>
                <Grid xs={6}>
                    <Tree value={files} onClick={fileIsSelected}/>
                </Grid>
                <Grid xs={18}>
                    {renderEditor()}
                </Grid>
            </Grid.Container>
        </Page>
    )
}

export default Editor;