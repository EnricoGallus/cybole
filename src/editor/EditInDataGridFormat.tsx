import React, { useEffect, useState } from 'react';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import BaseTable, { AutoResizer, ColumnShape, unflatten } from 'react-base-table';
import 'react-base-table/styles.css';
import { v4 as uuidv4 } from 'uuid';

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

const mapToNode = (row: DataRow): CybolNode => ({
    name: row.name,
    channel: row.channel,
    format: row.format,
    model: row.model,
    node: convertDataRowsToNode(row.children),
});

const convertDataRowsToNode = (rows: DataRow[]): CybolNode[] => rows.map(mapToNode);

const xmlOptions = { ignoreAttributes: false, attributeNamePrefix: '' };

function convertContentToTableFormat(content: string): DataRow[] {
    const xmlStructure = new XMLParser(xmlOptions).parse(content) as XmlStructure;
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

function mapDataRow(
    data: DataRow[],
    idToRemove: string | null,
    addNewAfterId: string | null,
    addNewChildAfterId: string | null
) {
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
            rows = rows.filter((x) => x.id !== idToRemove);
        }

        if (addNewAfterId && rows.some((row) => row.id === addNewAfterId)) {
            const index = rows.findIndex((s) => s.id === addNewAfterId) + 1;
            rows = [...rows.slice(0, index), newRow(parent), ...rows.slice(index)];
        }

        Object.entries(rows).forEach((entry) => {
            const row = { ...entry[1], children: [] };
            if (parent == null) {
                newArray.push(row);
            } else {
                parent.children.push(row);
            }

            let { children } = entry[1];
            if (addNewChildAfterId && entry[1].id === addNewChildAfterId) {
                children = [...children, newRow(entry[1])];
            }

            if (children.length) {
                loop(children, row);
            }
        });
    }

    loop(data, null);

    return newArray;
}

function saveData(pathToFile: string, data: DataRow[]) {
    const builder = new XMLBuilder({ ...xmlOptions, format: true, suppressEmptyNode: true });
    const xmlOutput = builder.build({ node: { node: convertDataRowsToNode(data) } });
    window.electron.writeFile(pathToFile, xmlOutput);
}

type RowHandler = {
    rowData: DataRow;
};

const channelTypes = ['inline', 'file'];

const rowEventHandlers = {
    onContextMenu(x: RowHandler) {
        window.electron.openContextMenu(x.rowData);
    },
};

const EditInDataGridFormat = (props: EditorProps) => {
    const [data, setData] = useState<DataRow[]>(unflatten(convertContentToTableFormat(props.content)));

    useEffect(() => {
        window.electron.on('delete-node', (event, rowData: DataRow) => {
            const newData = mapDataRow(data, rowData.id, null, null);
            updateData(newData);
        });

        window.electron.on('add-node', (event, rowData: DataRow) => {
            const newData = mapDataRow(data, null, rowData.id, null);
            updateData(newData);
        });

        window.electron.on('add-subnode', (event, rowData: DataRow) => {
            const newData = mapDataRow(data, null, null, rowData.id);
            updateData(newData);
        });
    });

    const expandColumnKey = `name`;
    const { fileKey } = props;

    const columns: ColumnShape<DataRow>[] = [
        {
            key: `name`,
            dataKey: `name`,
            title: `name`,
            width: 150,
            cellRenderer: ({ cellData, container, rowData }) => (
                <EditCell
                    cellData={cellData as string}
                    container={container}
                    rowData={rowData}
                    property="name"
                    renderType="input"
                    saveHandler={() => saveData(fileKey, container.getExpandedState().expandedData)}
                />
            ),
        },
        {
            key: `channel`,
            dataKey: `channel`,
            title: `channel`,
            width: 150,
            cellRenderer: ({ cellData, container, rowData }) => (
                <EditCell
                    cellData={cellData as string}
                    container={container}
                    renderType="select"
                    selectValues={channelTypes}
                    saveHandler={() => saveData(fileKey, container.getExpandedState().expandedData)}
                    rowData={rowData}
                    property="channel"
                />
            ),
        },
        {
            key: `format`,
            dataKey: `format`,
            title: `format`,
            width: 150,
            cellRenderer: ({ cellData, container, rowData }) => (
                <EditCell
                    cellData={cellData as string}
                    container={container}
                    rowData={rowData}
                    property="format"
                    renderType="input"
                    saveHandler={() => saveData(fileKey, container.getExpandedState().expandedData)}
                />
            ),
        },
        {
            key: `model`,
            dataKey: `model`,
            title: `model`,
            width: 150,
            cellRenderer: ({ cellData, container, rowData }) => (
                <EditCell
                    cellData={cellData as string}
                    container={container}
                    rowData={rowData}
                    property="model"
                    renderType="input"
                    saveHandler={() => saveData(fileKey, container.getExpandedState().expandedData)}
                />
            ),
        },
    ];

    const updateData = (newData: DataRow[]) => {
        setData(newData);
        saveData(fileKey, newData);
    };

    return (
        <div className="tableContainer">
            <AutoResizer>
                {({ width, height }) => (
                    <BaseTable
                        data={data}
                        width={width}
                        height={height}
                        fixed
                        columns={columns}
                        rowEventHandlers={rowEventHandlers}
                        expandColumnKey={expandColumnKey}
                    />
                )}
            </AutoResizer>
        </div>
    );
};

export default EditInDataGridFormat;
