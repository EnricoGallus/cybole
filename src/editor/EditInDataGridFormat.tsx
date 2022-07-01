import React from "react";
import {XMLParser} from 'fast-xml-parser'
import BaseTable, {Column, ColumnShape, unflatten} from 'react-base-table'
import 'react-base-table/styles.css'
import {Button, ButtonGroup} from "@geist-ui/core";
import {PlusSquare, Trash} from "@geist-ui/icons";
import { v4 as uuidv4 } from 'uuid';

import EditCellDropdown from "./EditCellDropdown";
import EditCellInput from "./EditCellInput";

function convertNodeToDataRow(node: any, parent: any): DataRow {
    const index = uuidv4();
    return { id: `${index}`, parentId: parent != null ? parent.id : null, name: node.name, channel: node.channel, format: node.format, model: node.model, children: [] };
}

function convertContentToTableFormat(content: string): DataRow[] {
    const xmlStructure = new XMLParser({ignoreAttributes: false, attributeNamePrefix: ""}).parse(content);
        const rows: DataRow[] = [];
    xmlStructure.node.node.forEach((node: any) => {
        const data = convertNodeToDataRow(node, null);
        rows.push(data);
        if (Object.prototype.toString.call(node.node) === '[object Array]') {
            node.node.forEach((node: any) => {
                rows.push(convertNodeToDataRow(node, data));
            })
        } else if (node.node !== undefined) {
            rows.push(convertNodeToDataRow(node.node, data));
        }
    })

    return rows;
}

type TableState = {
    data: DataRow[]
}

type TableProps = {
    content: String,
    fileKey: String
}

export default class EditInDataGridFormat extends React.Component<TableProps, TableState> {
    constructor(props: any) {
        super(props);
        this.state = { data: unflatten(convertContentToTableFormat(props.content)) };
    }

    updateData(newData: DataRow[]) {
        this.setState((state) => {
            return {data: newData}
        });
    }

    expandColumnKey = `name`;
    columns: ColumnShape<DataRow>[] = [
        {
            key: `name`,
            dataKey: `name`,
            title: `name`,
            width: 150,
            // @ts-ignore
            cellRenderer: EditCellDropdown
        },
        {
            key: `channel`,
            dataKey: `channel`,
            title: `channel`,
            width: 150,
            // @ts-ignore
            cellRenderer: EditCellInput
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
                                const index = this.state.data.findIndex(s => s.id === rowData.id) + 1;
                                this.updateData([
                                    ...this.state.data.slice(0, index),
                                    newRow,
                                    ...this.state.data.slice(index)]);
                            }}
                    />
                    {rowData.parentId == null ?
                    <Button icon={<PlusSquare />}
                            onClick={() => {
                                const index = uuidv4();
                                const newChild = {id: `${index}`, parentId: `${rowData.id}`, name: '', channel: '', format: '', model: '', children: []};
                                this.updateData(this.state.data.map(item =>
                                    item.id === rowData.id
                                        ? {...item, children: [...item.children, newChild]}
                                        : item));
                            }}>
                    </Button> : ''}
                    <Button icon={<Trash />} type="error" ghost
                            onClick={() => {
                                this.updateData(this.state.data.filter(x => x.id !== rowData.id));
                            }}>
                    </Button>
                </ButtonGroup>
            ),
        },
    ];

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
