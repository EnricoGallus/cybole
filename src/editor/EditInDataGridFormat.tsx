import React, {useState} from "react";
import {XMLParser} from 'fast-xml-parser'
import BaseTable, {Column, ColumnShape, unflatten} from 'react-base-table'
import 'react-base-table/styles.css'
import {Button, ButtonGroup} from "@geist-ui/core";
import {PlusSquare, Trash} from "@geist-ui/icons";
import EditCellDropdown from "./EditCellDropdown";
import EditCellInput from "./EditCellInput";

type DataRow = {
    id: string,
    parentId: string | null,
    name: string;
    channel: string;
    format: string;
    model: string;
    children: DataRow[];
};

function convertContentToTableFormat(content: string): DataRow[] {
    var xmlStructure = new XMLParser({ignoreAttributes: false, attributeNamePrefix: ""}).parse(content),
        rows: DataRow[] = [];
    xmlStructure.node.node.forEach(function (node: any, index: number) {
        var data = convertNodeToDataRow(node, index, null);
        rows.push(data);
        if (Object.prototype.toString.call(node.node) === '[object Array]') {
            node.node.forEach(function (node: any, index: number) {
                rows.push(convertNodeToDataRow(node, index, data));
            })
        } else if (node.node !== undefined) {
            rows.push(convertNodeToDataRow(node.node, 0, data));
        }
    })

    return rows;
}

function convertNodeToDataRow(node: any, index: number, parent: any): DataRow {
    return { id: parent == null ? `${index}` : `${parent.id}_${index}`, parentId: parent != null ? parent.id : null, name: node.name, channel: node.channel, format: node.format, model: node.model, children: [] };
}

const expandColumnKey = `name`;


export default function EditInDataGridFormat(props: any) {
    const [data, setData] = useState<DataRow[]>(convertContentToTableFormat(props.content));
    const columns: ColumnShape<DataRow>[] = [
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
                            const newRow = {id: '1000', parentId: null, name: 'test', channel: '', format: '', model: '', children: []};
                            const index = data.findIndex(s => s.id === rowData.id) + 1;
                            setData([
                                ...data.slice(0, index),
                                newRow,
                                ...data.slice(index)]
                            )
                        }}
                    />
                    <Button icon={<PlusSquare />}
                            onClick={() => {
                                const index = 1000;
                                const newChild = {id: `${index}`, parentId: `${rowData.id}_${index}`, name: '', channel: '', format: '', model: '', children: []};
                                setData(data.map(item =>
                                    item.id === rowData.id
                                        ? {...item, children: [...item.children, newChild]}
                                        : item));
                            }}
                    />
                    <Button icon={<Trash />} type="error" ghost
                        onClick={() => {
                            setData(data.filter(x => x.id !== rowData.id))
                        }}
                    />
                </ButtonGroup>
            ),
        },
    ];

    const treeData = unflatten(data);

    return (
        <div>
            <BaseTable data={treeData} width={800} height={600}
                       fixed
                       columns={columns}
                       expandColumnKey={expandColumnKey} />
        </div>
    );
}
