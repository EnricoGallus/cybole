type CybolNode = {
    name: string;
    channel: string;
    format: string;
    model: string;
    node: CybolNode[] | CybolNode | undefined;
};

type XmlStructure = {
    node: {
        node: CybolNode[];
    };
};
