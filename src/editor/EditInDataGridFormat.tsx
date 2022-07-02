import React from "react";
import {XMLParser} from 'fast-xml-parser'
import BaseTable, {Column, ColumnShape, unflatten} from 'react-base-table'
import 'react-base-table/styles.css'
import {Button, ButtonGroup} from "@geist-ui/core";
import {PlusSquare, Trash} from "@geist-ui/icons";
import { v4 as uuidv4 } from 'uuid';

import EditCell from "./EditCell";

function convertNodeToDataRow(node: CybolNode, parent: DataRow | null): DataRow {
    const index = uuidv4();
    return { id: `${index}`, parentId: parent != null ? parent.id : null, name: node.name, channel: node.channel, format: node.format, model: node.model, children: [] };
}

function convertContentToTableFormat(content: string): DataRow[] {
    const xmlStructure = new XMLParser({ignoreAttributes: false, attributeNamePrefix: ""}).parse(content) as XmlStructure;
    const rows: DataRow[] = [];
    xmlStructure.node.node.forEach((node: CybolNode) => {
        const data = convertNodeToDataRow(node, null);
        rows.push(data);
        if (node.node !== undefined) {
            if (Array.isArray(node.node)) {
                node.node.forEach(childNode => {
                    rows.push(convertNodeToDataRow(childNode, data));
                })
            } else if (node.node !== undefined) {
                rows.push(convertNodeToDataRow(node.node, data));
            }
        }
    })

    return rows;
}

type TableState = {
    data: DataRow[]
}

const channelTypes = ['test', 'test2'];

export default class EditInDataGridFormat extends React.Component<EditorProps, TableState> {
    expandColumnKey = `name`;

    columns: ColumnShape<DataRow>[] = [
        {
            key: `name`,
            dataKey: `name`,
            title: `name`,
            width: 150,
            cellRenderer: ({ cellData, container }) =>
                <EditCell cellData={cellData as string} container={container} renderType="input" />
        },
        {
            key: `channel`,
            dataKey: `channel`,
            title: `channel`,
            width: 150,
            cellRenderer: ({ cellData, container }) =>
                <EditCell cellData={cellData as string} container={container} renderType="select"  selectValues={channelTypes} />
        },
        {
            key: `format`,
            dataKey: `format`,
            title: `format`,
            width: 150,
        },
        {
            key: `model`,
            dataKey: `model`,
            title: `model`,
            width: 150,
        },
        {
            key: 'action',
            width: 150,
            align: Column.Alignment.CENTER,
            frozen: Column.FrozenDirection.RIGHT,
            cellRenderer: ({ rowData }) => (

                <ButtonGroup>
                    <Button icon={<PlusSquare />}
                            onClick={() => {
                                const newRow = {id: uuidv4(), parentId: null, name: 'test', channel: '', format: '', model: '', children: []};
                                const { data } = this.state;
                                const index = data.findIndex(s => s.id === rowData.id) + 1;
                                this.updateData([...data.slice(0, index), newRow, ...data.slice(index)]);
                            }}
                    />
                    {rowData.parentId == null ?
                        <Button icon={<PlusSquare />}
                                onClick={() => {
                                    const index = uuidv4();
                                    const newChild = {id: `${index}`, parentId: `${rowData.id}`, name: '', channel: '', format: '', model: '', children: []};
                                    const { data } = this.state;
                                    this.updateData(data.map(item =>
                                        item.id === rowData.id
                                            ? {...item, children: [...item.children, newChild]}
                                            : item));
                                }} /> : ''}
                    <Button icon={<Trash />} type="error" ghost
                            onClick={() => {
                                const { data } = this.state;
                                this.updateData(data.filter(x => x.id !== rowData.id));
                            }} />
                </ButtonGroup>
            ),
        },
    ];

    constructor(props: EditorProps) {
        super(props);
        this.state = { data: unflatten(convertContentToTableFormat(props.content)) };
    }

    updateData(newData: DataRow[]) {
        this.setState(() => ({data: newData}));
    }

    render() {
        const {data} = this.state;
        return (<div>
            <BaseTable data={data} width={800} height={600}
                       fixed
                       columns={this.columns}
                       expandColumnKey={this.expandColumnKey}/>
        </div>)
    }
}
