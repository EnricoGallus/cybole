import {Link, useLocation} from "react-router-dom";
import {useEffect, useState} from "react";
import {Tree, useToasts} from "@geist-ui/core";

function Editor() {
    const location = useLocation();
    const [files, setFiles] = useState([]);
    const { setToast } = useToasts()
    const handler = (item: any) => {
        console.log(item)
        setToast({ text: item })
    }
    useEffect(() => {
        window.electron.getFiles(location.state).then(function (result: any) {
            console.log(result);
            let tree: any = [];
            tree.push(result);
            setFiles(tree);
        }, function (error: any) {
            console.log(error);
        });
    }, [location.state]);

    return (
        <div id="editor">
            Editor
            <Link to="/" className="btn btn-primary">Back to ProjectSelection</Link>
            <Tree value={files} onClick={handler} />
        </div>
    )
}

export default Editor;