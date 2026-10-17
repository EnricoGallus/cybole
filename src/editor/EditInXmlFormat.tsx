import { Builder, Util, XmlEditor } from 'react-xml-editor';
import {useRef, useState} from 'react';
import type { DocSpec, Xml } from 'react-xml-editor/lib/src/types';
import 'react-xml-editor/css/xonomy.css';
import {writeTextFile} from "../platform/files";

const EditInXmlFormat = (props: EditorProps) => {
    const { content, fileKey, stateChanger } = props;
    const [xmlContent] = useState(content);
    const [editorKey] = useState(fileKey);
    const xmlEditorRef = useRef<XmlEditor>(null);
    const nodeDef = '<node name="" channel="" format="" model=""/>';
    const cybolDef: DocSpec = {
        elements: {
            node: {
                attributes: {
                    name: {
                        asker: Util.askString,
                    },
                    channel: {
                        asker: Util.askPicklist([
                            {
                                value: 'inline',
                                caption: 'inline',
                            },
                            {
                                value: 'file',
                                caption: 'file',
                            },
                        ]),
                    },
                    format: {
                        asker: Util.askString,
                    },
                    model: {
                        asker: Util.askString,
                    },
                },
                menu: [
                    {
                        action: Util.newElementChild(nodeDef),
                        caption: 'Append child <node />',
                    },
                    /* {
                    action: Util.newAttribute({
                        name: 'label',
                        value: 'default value',
                    }),
                    caption: 'Add attribute @label',
                    hideIf: (xml: Xml, id: string[]) => {
                        const element = Util.getXmlNode(xml, id);
                        return element && element.$ && typeof element.$.label !== 'undefined';
                    },
                }, */ {
                        action: Util.deleteElement,
                        caption: 'Delete this <node />',
                        icon: 'exclamation.png',
                    },
                    {
                        action: Util.newElementBefore(nodeDef),
                        caption: 'New <node /> before this',
                    },
                    {
                        action: Util.newElementAfter(nodeDef),
                        caption: 'New <node /> after this',
                    },
                    {
                        action: Util.duplicateElement,
                        caption: 'Duplicate <node />',
                    },
                    {
                        action: Util.moveElementUp,
                        caption: 'Move <node /> up',
                        hideIf: (xml: Xml, id: string[]) => !Util.canMoveElementUp(xml, id),
                    },
                    {
                        action: Util.moveElementDown,
                        caption: 'Move <node /> down',
                        hideIf: (xml: Xml, id: string[]) => !Util.canMoveElementDown(xml, id),
                    },
                ],
            },
        },
    };

    const saveChanges = () => {
        const xml = xmlEditorRef.current?.getXml();
        const fileContent = new Builder({}).buildObject(xml as Xml);
        writeTextFile(fileKey, fileContent);
        stateChanger(fileContent);
    };

    return (
        <XmlEditor
            key={editorKey}
            docSpec={cybolDef}
            ref={xmlEditorRef}
            xml={xmlContent}
            onChange={() => saveChanges()}
        />
    );
};

export default EditInXmlFormat;
