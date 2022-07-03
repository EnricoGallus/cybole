import { Util, XmlEditor } from 'react-xml-editor';
import { createRef, useState } from 'react';
import {DocSpec, Xml} from 'react-xml-editor/lib/types';
import 'react-xml-editor/css/xonomy.css';

const EditInXmlFormat = (props: EditorProps) => {
    const { content, fileKey } = props;
    const [xmlContent] = useState(content);
    const [editorKey] = useState(fileKey);
    const xmlEditorRef = createRef<XmlEditor>();
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
                            }
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
                        caption: 'Copy <node />',
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

    return <XmlEditor key={editorKey} docSpec={cybolDef} ref={xmlEditorRef} xml={xmlContent} />;
};

export default EditInXmlFormat;
