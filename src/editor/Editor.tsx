import {Link, useLocation} from "react-router-dom";
import {createRef, useEffect, useState} from "react";
import {Grid, Tree} from "@geist-ui/core";
import {Util, XmlEditor} from "react-xml-editor";
import {DocSpec, Xml} from "react-xml-editor/lib/types";
import "react-xml-editor/css/xonomy.css"

function Editor() {
    const location = useLocation();
    const [files, setFiles] = useState([]);
    const [xml, setXml] = useState('');
    const [editorKey, setEditorKey] = useState('');
    const xmlEditorRef = createRef<XmlEditor>();
    const nodeDef = '<node name="" channel="" format="" model=""/>';
    const cybolDef: DocSpec = {
        elements: {
            node: {
                attributes: {
                    name: {
                        asker: Util.askString,
                        menu: [{
                            action: Util.deleteAttribute,
                            caption: 'Delete attribute',
                        }],
                    },
                    channel: {
                        asker: Util.askPicklist([{
                            value: 'short', caption: 'short'
                        }, {
                            value: 'medium', caption: 'medium',
                        }, 'long']),
                    },
                    format: {
                        asker: Util.askPicklist([{
                            value: 'short', caption: 'short'
                        }, {
                            value: 'medium', caption: 'medium',
                        }, 'long']),
                    },
                    model: {
                        asker: Util.askPicklist([{
                            value: 'short', caption: 'short'
                        }, {
                            value: 'medium', caption: 'medium',
                        }, 'long']),
                    },
                },
                menu: [{
                    action: Util.newElementChild(nodeDef),
                    caption: 'Append child <node />',
                }, {
                    action: Util.newAttribute({
                        name: 'label',
                        value: 'default value',
                    }),
                    caption: 'Add attribute @label',
                    hideIf: (xml: Xml, id: string[]) => {
                        const element = Util.getXmlNode(xml, id);
                        return element && element.$ && typeof element.$.label !== 'undefined';
                    },
                }, {
                    action: Util.deleteElement,
                    caption: 'Delete this <node />',
                    icon: 'exclamation.png',
                }, {
                    action: Util.newElementBefore(nodeDef),
                    caption: 'New <node /> before this',
                }, {
                    action: Util.newElementAfter(nodeDef),
                    caption: 'New <node /> after this',
                }, {
                    action: Util.duplicateElement,
                    caption: 'Copy <node />',
                }, {
                    action: Util.moveElementUp,
                    caption: 'Move <node /> up',
                    hideIf: (xml: Xml, id: string[]) => !Util.canMoveElementUp(xml, id),
                }, {
                    action: Util.moveElementDown,
                    caption: 'Move <node /> down',
                    hideIf: (xml: Xml, id: string[]) => !Util.canMoveElementDown(xml, id),
                }]
            },
        }
    };
    const handler = (item: any) => {
        window.electron.readFile({basePath: location.state, relativePath: item})
            .then((content: string) => {
                setEditorKey(item);
                setXml(content);
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
        // eslint-disable-next-line react/jsx-no-undef
        <Grid.Container id="editor">
            <Grid xs={12}>
                Editor
            </Grid>
            <Grid xs={12}>
                <Link to="/" className="btn btn-primary">Back to ProjectSelection</Link>
            </Grid>
            <Grid xs={6}>
                <Tree value={files} onClick={handler}/>
            </Grid>
            <Grid xs={18}>
                <XmlEditor key={editorKey}
                           docSpec={cybolDef}
                           ref={xmlEditorRef}
                           xml={xml} />
            </Grid>
        </Grid.Container>
    )
}

export default Editor;