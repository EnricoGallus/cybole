type DataRow = {
    id: string;
    parentId: string | null;
    name: string;
    channel: string;
    format: string;
    model: string;
    children: DataRow[];
};
