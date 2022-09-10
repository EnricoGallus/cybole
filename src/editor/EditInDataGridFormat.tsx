import React, {useEffect, useRef, useState} from 'react';
import { XMLParser } from 'fast-xml-parser';

import {Column} from "primereact/column";
import {TreeTable} from "primereact/treetable";
import {Toast} from "primereact/toast";
import {ContextMenu} from "primereact/contextmenu";
import {InputText} from "primereact/inputtext";
import {Dropdown} from "primereact/dropdown";

function convertNodeToDataRow(node: CybolNode | null, index: number, parent: DataRow | null): DataRow {
    return {
        key: parent == null ? index.toString() : parent.key + '-' + index,
        data: {
            index: index,
            name: node ? node.name : 'new Node',
            channel: node ? node.channel : '',
            format: node ? node.format : '',
            model: node ? node.model : '',
        },
        children: [],
    };
}

function getNextIndex(nodes: DataRow[]) : number {
    return nodes.length === 0 ? 0 : Math.max(...nodes.map(o => o.data.index)) + 1
}

const xmlOptions = { ignoreAttributes: false, attributeNamePrefix: '' };

function convertContentToTableFormat(content: string): DataRow[] {
    const xmlStructure = new XMLParser(xmlOptions).parse(content) as XmlStructure;
    const rows: DataRow[] = [];
    for (let i = 0; i < xmlStructure.node.node.length; i++){
        const node: CybolNode = xmlStructure.node.node[i];
        const data = convertNodeToDataRow(node, i, null);
        rows.push(data);
        if (node.node !== undefined) {
            if (Array.isArray(node.node)) {
                for (let j = 0; j < node.node.length; j++){
                    const childNode = node.node[j];
                    data.children.push(convertNodeToDataRow(childNode, j, data));
                }
            } else {
                data.children.push(convertNodeToDataRow(node.node, 0, data));
            }
        }
    }

    return rows;
}

const channelTypes = ['inline', 'file'];

const EditInDataGridFormat = (props: EditorProps) => {
    const [data, setData] = useState<DataRow[]>();
    const [selectedNodeKey, setSelectedNodeKey] = useState(undefined);
    const toast = useRef(null);
    const cm = useRef(null);

    const findNodeParentByKey = (nodes: DataRow[], key: string) => {
        let path = key.split('-');
        let node, parent;

        while (path.length) {
            let list: DataRow[] = node ? node.children : nodes;
            node = list[parseInt(path[0], 10)];
            if (path.length - 1 && path.length - 1 > 0) {
                parent = node;
            }

            path.shift();
        }

        return {node: node, parent: parent };
    }

    const onEditorValueChange = (options, value) => {
        let newNodes = JSON.parse(JSON.stringify(data));
        let { node } = findNodeParentByKey(newNodes, options.node.key);
        node.data[options.field] = value;

        setData(newNodes);
    }

    const inputTextEditor = (options) => {
        return (
            <InputText type="text" value={options.rowData[options.field]}
                       onChange={(e) => onEditorValueChange(options, e.target.value)} />
        );
    }

    const dropDownEditor = (options) => {
        return (
            <Dropdown value={options.rowData[options.field]} options={channelTypes} onChange={(e) => onEditorValueChange(options, e.value)}/>
        )
    }

    const menu = [
        {
            label: 'Add Node',
            icon: 'pi pi-plus',
            command: () => {
                let newNodes = JSON.parse(JSON.stringify(data));
                let {parent} = findNodeParentByKey(newNodes, selectedNodeKey);
                if (parent == null) {
                    const index = newNodes.findIndex((node: DataRow) => node.key === selectedNodeKey)
                    const newNode = convertNodeToDataRow(null, getNextIndex(newNodes), null);
                    setData([...newNodes.slice(0, index), newNode, ...newNodes.slice(index)]);
                } else {
                    const index = parent.children.findIndex((node: DataRow) => node.key === selectedNodeKey)
                    const newNode = convertNodeToDataRow(null, getNextIndex(parent.children), parent);
                    parent.children = [...parent.children.slice(0, index), newNode, ...parent.children.slice(index)];
                    setData(newNodes);
                }
                toast?.current.show({ severity: 'success', summary: 'Addde Node', detail: selectedNodeKey });
            }
        },
        {
            label: 'Add SubNode',
            icon: 'pi pi-arrow-down',
            command: () => {
                let newNodes = JSON.parse(JSON.stringify(data));
                let {parent, node} = findNodeParentByKey(newNodes, selectedNodeKey);
                node.children.push(convertNodeToDataRow(null, getNextIndex(node.children), node))
                setData(newNodes);
                toast?.current.show({ severity: 'success', summary: 'Add SubNode', detail: selectedNodeKey });
            }
        },
        {
            label: 'Delete',
            icon: 'pi pi-trash',
            command: () => {
                let newNodes = JSON.parse(JSON.stringify(data));
                let {parent} = findNodeParentByKey(newNodes, selectedNodeKey);
                parent.children = parent.children.filter((child: DataRow) => child.key != selectedNodeKey);
                setData(newNodes);
                toast?.current.show({ severity: 'success', summary: 'Delete Node', detail: selectedNodeKey });
            }
        }
    ];

    useEffect(() => {
        setData(convertContentToTableFormat(props.content))
    }, []);

    return (
        <div className="tableContainer">
            <Toast ref={toast} />

            <ContextMenu model={menu} ref={cm} onHide={() => setSelectedNodeKey(null)} />
            <TreeTable value={data}
                       contextMenuSelectionKey={selectedNodeKey} onContextMenuSelectionChange={event => setSelectedNodeKey(event.value)}
                       onContextMenu={event => cm.current.show(event.originalEvent)}>
                <Column field="name" header="Name" editor={inputTextEditor} expander></Column>
                <Column field="channel" header="Channel" editor={dropDownEditor}></Column>
                <Column field="format" header="Format" editor={inputTextEditor}></Column>
                <Column field="model" header="Model" editor={inputTextEditor}></Column>
            </TreeTable>
        </div>
    );
};

export default EditInDataGridFormat;
