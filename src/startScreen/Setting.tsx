import {useEffect} from "react";
import {Link} from "react-router-dom";

function Setting() {
    useEffect(() => {
    }, [])

    return (
        <div>
            Setting
            <Link to="/" className="btn btn-primary">Back to Project Selection</Link>
        </div>
    )
}

export default Setting;