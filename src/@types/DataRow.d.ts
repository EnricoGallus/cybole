type DataRow = {
    key: string;
    data: {
        index: number,
        name: string;
        channel: string;
        format: string;
        model: string;
    }
    children: DataRow[];
};
