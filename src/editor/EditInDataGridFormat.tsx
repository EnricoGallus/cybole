import React, {useEffect, useRef, useState} from 'react';
import {XMLBuilder, XMLParser} from 'fast-xml-parser';

import {Column, ColumnEditorOptions} from "primereact/column";
import {TreeTable} from "primereact/treetable";
import {Toast} from "primereact/toast";
import {ContextMenu} from "primereact/contextmenu";
import {InputText} from "primereact/inputtext";
import {Dropdown} from "primereact/dropdown";
import {writeTextFile} from "@tauri-apps/api/fs";

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

const mapToNode = (row: DataRow): CybolNode => ({
    name: row.data.name,
    channel: row.data.channel,
    format: row.data.format,
    model: row.data.model,
    node: convertDataRowsToNode(row.children),
});

const convertDataRowsToNode = (rows: DataRow[]): CybolNode[] => rows.map(mapToNode);

const channelTypes = ['inline', 'file'];

const EditInDataGridFormat = (props: EditorProps) => {
    const { fileKey, stateChanger } = props;
    const [data, setData] = useState<DataRow[]>();
    const [selectedNodeKey, setSelectedNodeKey] = useState(null);
    const toast = useRef<Toast>(null);
    const cm = useRef<ContextMenu>(null);

    const saveData = (pathToFile: string, data: DataRow[]) => {
        const builder = new XMLBuilder({ ...xmlOptions, format: true, suppressEmptyNode: false });
        const xmlOutput = builder.build({ node: { node: convertDataRowsToNode(data) } });
        writeTextFile(pathToFile, xmlOutput);
        stateChanger(xmlOutput);
    }

    const findNodeParentByKey = (nodes: DataRow[], key: string | null) => {
        if (key == undefined) {
            throw new DOMException();
        }

        let path = key.split('-');
        let node, parent;
        let currentPath = '';

        while (path.length) {
            let list: DataRow[] = node ? node.children : nodes;
            currentPath = node ? currentPath + '-' + path[0] : path[0];
            node = list.find((node: DataRow) => node.key === currentPath);
            if (path.length - 1 && path.length - 1 > 0) {
                parent = node;
            }

            path.shift();
        }

        return {node: node, parent: parent };
    }

    const onEditorValueChange = (options: ColumnEditorOptions, value: any) => {
        let newNodes = JSON.parse(JSON.stringify(data));
        let { node } = findNodeParentByKey(newNodes, options.node.key);
        // @ts-ignore
        node.data[options.field] = value;
        updateData(newNodes);
    }

    const inputTextEditor = (options: ColumnEditorOptions) => {
        return (
            <InputText type="text" value={options.rowData[options.field]}
                       onChange={(e) => onEditorValueChange(options, e.target.value)} />
        );
    }

    const dropDownEditor = (options: ColumnEditorOptions) => {
        return (
            <Dropdown value={options.rowData[options.field]} options={channelTypes} onChange={(e) => onEditorValueChange(options, e.value)}/>
        )
    }

    const updateData = (newData: DataRow[]) => {
        setData(newData);
        saveData(fileKey, newData);
    };

    const menu = [
        {
            label: 'Add Node',
            icon: 'pi pi-plus',
            command: () => {
                let newNodes = JSON.parse(JSON.stringify(data));
                let {parent} = findNodeParentByKey(newNodes, selectedNodeKey);
                if (parent == undefined) {
                    const index = newNodes.findIndex((node: DataRow) => node.key === selectedNodeKey) + 1;
                    const newNode = convertNodeToDataRow(null, getNextIndex(newNodes), null);
                    newNodes = [...newNodes.slice(0, index), newNode, ...newNodes.slice(index)];
                } else {
                    const index = parent.children.findIndex((node: DataRow) => node.key === selectedNodeKey) + 1;
                    const newNode = convertNodeToDataRow(null, getNextIndex(parent.children), parent);
                    parent.children = [...parent.children.slice(0, index), newNode, ...parent.children.slice(index)];
                }
                updateData(newNodes);
                toast.current?.show({ severity: 'success', summary: 'Addde Node', detail: selectedNodeKey });
            }
        },
        {
            label: 'Add SubNode',
            icon: 'pi pi-arrow-down',
            command: () => {
                let newNodes = JSON.parse(JSON.stringify(data));
                let {node} = findNodeParentByKey(newNodes, selectedNodeKey);
                if (node === undefined) {
                    toast?.current?.show({ severity: 'error', summary: 'Add SubNode failed', detail: selectedNodeKey });
                } else {
                    node.children.push(convertNodeToDataRow(null, getNextIndex(node.children), node))
                    updateData(newNodes);
                    toast.current?.show({severity: 'success', summary: 'Add SubNode', detail: selectedNodeKey});
                }
            }
        },
        {
            label: 'Delete',
            icon: 'pi pi-trash',
            command: () => {
                let newNodes = JSON.parse(JSON.stringify(data));
                let {parent} = findNodeParentByKey(newNodes, selectedNodeKey);
                if (parent === undefined) {
                    newNodes = newNodes.filter((node: DataRow) => node.key != selectedNodeKey);
                } else {
                    parent.children = parent.children.filter((child: DataRow) => child.key != selectedNodeKey);
                }

                updateData(newNodes);
                toast?.current?.show({ severity: 'success', summary: 'Delete Node', detail: selectedNodeKey });
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
                // @ts-ignore
                       contextMenuSelectionKey={selectedNodeKey} onContextMenuSelectionChange={event => setSelectedNodeKey(event.value)}
                       onContextMenu={event => cm.current?.show(event.originalEvent)}>
                <Column field="name" header="Name" editor={inputTextEditor} expander></Column>
                <Column field="channel" header="Channel" editor={dropDownEditor}></Column>
                <Column field="format" header="Format" editor={inputTextEditor}></Column>
                <Column field="model" header="Model" editor={inputTextEditor}></Column>
            </TreeTable>
        </div>
    );
};

export default EditInDataGridFormat;
