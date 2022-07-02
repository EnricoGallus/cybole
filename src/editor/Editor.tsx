import {Link, useLocation} from "react-router-dom";
import {useEffect, useState} from "react";
import {Grid, Page, Radio, Tree} from "@geist-ui/core";
import EditInXmlFormat from "./EditInXmlFormat";
import EditInDataGridFormat from "./EditInDataGridFormat";

export enum EDITOR_TYPE {
    XML= "0",
    DATA_GRID = "1"
}

function Editor() {
    const location = useLocation();
    const [editorType, setEditorType] = useState(EDITOR_TYPE.XML);
    const [files, setFiles] = useState([]);
    const [content, setContent] = useState('');
    const [editorKey, setEditorKey] = useState('');

    const renderEditor = () => {
        if (editorType === EDITOR_TYPE.XML) {
            return <EditInXmlFormat key={editorKey} fileKey={editorKey} content={content} />
        } else if (editorType === EDITOR_TYPE.DATA_GRID) {
            return <EditInDataGridFormat key={editorKey} fileKey={editorKey} content={content} />
        }
    }

    const editorTypeChanged = (val: any) => {
        setEditorType(val);
    }

    const fileIsSelected = (item: any) => {
        window.electron.readFile({basePath: location.state, relativePath: item})
            .then((content: string) => {
                setEditorKey(item);
                setContent(content);
            });
    }
    useEffect(() => {
        window.electron.getFiles(location.state).then(function (result: any) {
            let tree: any = [];
            tree.push(result);
            setFiles(tree);
        }, function (error: any) {
            console.log(error);
        });
    }, [location.state]);

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