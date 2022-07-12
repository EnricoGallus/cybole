import React from 'react';
import {XMLBuilder, XMLParser} from 'fast-xml-parser';
import BaseTable, {AutoResizer, Column, ColumnShape, unflatten} from 'react-base-table';
import 'react-base-table/styles.css';
import {Button, ButtonGroup} from '@geist-ui/core';
import {PlusSquare, Trash} from '@geist-ui/icons';
import {v4 as uuidv4} from 'uuid';

import EditCell from './EditCell';

function convertNodeToDataRow(node: CybolNode, parent: DataRow | null): DataRow {
    const index = uuidv4();
    return {
        id: `${index}`,
        parentId: parent != null ? parent.id : null,
        name: node.name,
        channel: node.channel,
        format: node.format,
        model: node.model,
        children: [],
    };
}

const convertDataRowsToNode = (rows: DataRow[]) : CybolNode[] => rows.map(mapToNode);

const mapToNode = (row: DataRow) : CybolNode => ({
    name: row.name,
    channel: row.channel,
    format: row.format,
    model: row.model,
    node: convertDataRowsToNode(row.children),
});


const xmlOptions = {ignoreAttributes: false, attributeNamePrefix: ''};

function convertContentToTableFormat(content: string): DataRow[] {
    const xmlStructure = new XMLParser(xmlOptions).parse(
        content
    ) as XmlStructure;
    const rows: DataRow[] = [];
    xmlStructure.node.node.forEach((node: CybolNode) => {
        const data = convertNodeToDataRow(node, null);
        rows.push(data);
        if (node.node !== undefined) {
            if (Array.isArray(node.node)) {
                node.node.forEach((childNode) => {
                    rows.push(convertNodeToDataRow(childNode, data));
                });
            } else if (node.node !== undefined) {
                rows.push(convertNodeToDataRow(node.node, data));
            }
        }
    });

    return rows;
}

function mapDataRow(data: DataRow[], idToRemove: string | null, addNewAfterId: string | null, addNewChildAfterId: string | null) {

    const newArray: DataRow[] = [];

    function newRow(parent: DataRow | null) {
        return {
            id: uuidv4(),
            parentId: parent != null ? parent.id : null,
            name: 'new Node',
            channel: '',
            format: '',
            model: '',
            children: [],
        };
    }

    function loop(rows: DataRow[], parent: DataRow | null) {
        if (idToRemove && rows.some((row) => row.id === idToRemove)) {
            rows = rows.filter(x => x.id !== idToRemove)
        }

        if (addNewAfterId && rows.some((row) => row.id === addNewAfterId)) {
            const index = rows.findIndex((s) => s.id === addNewAfterId) + 1;
            rows = [...rows.slice(0, index), newRow(parent), ...rows.slice(index)]
        }

        Object.entries(rows).forEach(entry => {
            const row = {...entry[1], children: []}
            parent == null ? newArray.push(row) : parent.children.push(row);
            let {children} = entry[1]
            if (addNewChildAfterId && entry[1].id === addNewChildAfterId) {
                children = [...children, newRow(entry[1])]
            }

            if (children.length) {
                loop(children, row);
            }
        });
    }

    loop(data, null);

    return newArray;
}

function saveData(pathToFile:string, data: DataRow[]) {
    const builder = new XMLBuilder({...xmlOptions, format: true, suppressEmptyNode: true});
    const xmlOutput = builder.build({node: {node: convertDataRowsToNode(data)}});
    window.electron.writeFile(pathToFile, xmlOutput);
}

type TableState = {
    data: DataRow[];
};

const channelTypes = ['inline', 'file'];

export default class EditInDataGridFormat extends React.Component<EditorProps, TableState> {
    expandColumnKey = `name`;

    fileKey = this.props.fileKey;

    columns: ColumnShape<DataRow>[] = [
        {
            key: `name`,
            dataKey: `name`,
            title: `name`,
            width: 150,
            cellRenderer: ({cellData, container, rowData}) => (
                <EditCell cellData={cellData as string} container={container} rowData={rowData} property="name"
                          renderType="input" saveHandler={() => saveData(this.fileKey, container.getExpandedState().expandedData)}/>
            ),
        },
        {
            key: `channel`,
            dataKey: `channel`,
            title: `channel`,
            width: 150,
            cellRenderer: ({cellData, container, rowData}) => (
                <EditCell
                    cellData={cellData as string}
                    container={container}
                    renderType="select"
                    selectValues={channelTypes}
                    saveHandler={() => saveData(this.fileKey, container.getExpandedState().expandedData)} rowData={rowData} property="channel"
                />
            ),
        },
        {
            key: `format`,
            dataKey: `format`,
            title: `format`,
            width: 150,
            cellRenderer: ({cellData, container, rowData}) => (
                <EditCell cellData={cellData as string} container={container} rowData={rowData} property="format"
                          renderType="input" saveHandler={() => saveData(this.fileKey, container.getExpandedState().expandedData)}/>
            ),
        },
        {
            key: `model`,
            dataKey: `model`,
            title: `model`,
            width: 150,
            cellRenderer: ({cellData, container, rowData}) => (
                <EditCell cellData={cellData as string} container={container} rowData={rowData} property="model"
                          renderType="input" saveHandler={() => saveData(this.fileKey, container.getExpandedState().expandedData)}/>
            ),
        },
        {
            key: 'action',
            width: 200,
            align: Column.Alignment.CENTER,
            frozen: Column.FrozenDirection.RIGHT,
            cellRenderer: ({rowData}) => (
                <ButtonGroup>
                    <Button
                        icon={<PlusSquare/>}
                        onClick={() => {
                            const {data} = this.state;
                            const newData = mapDataRow(data, null, rowData.id, null);
                            this.updateData(newData);
                        }}
                    />
                    <Button
                        icon={<PlusSquare/>}
                        onClick={() => {
                            const {data} = this.state;
                            const newData = mapDataRow(data, null, null, rowData.id)
                            this.updateData(newData);
                        }}
                    />
                    <Button
                        icon={<Trash/>}
                        type="error"
                        ghost
                        onClick={() => {
                            const {data} = this.state;
                            const newData = mapDataRow(data, rowData.id, null, null);
                            this.updateData(newData);
                        }}
                    />
                </ButtonGroup>
            ),
        },
    ];

    constructor(props: EditorProps) {
        super(props);
        this.state = {data: unflatten(convertContentToTableFormat(props.content))};
    }

    updateData(newData: DataRow[]) {
        this.setState(() => ({data: newData}));
        saveData(this.fileKey, newData);
    }

    render() {
        const {data} = this.state;
        return (
            <div className="tableContainer">
                <AutoResizer>
                    {({width, height}) => (
                        <BaseTable
                            data={data}
                            width={width}
                            height={height}
                            fixed
                            columns={this.columns}
                            expandColumnKey={this.expandColumnKey}
                        />
                    )}
                </AutoResizer>
            </div>
        );
    }
}
