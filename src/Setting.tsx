import {useEffect} from "react";

function Setting() {
    useEffect(() => {
        const storedPreference = localStorage.getItem('darkModePreference');
    })

    return (
        <div>
            Setting
        </div>
    )
}

export default Setting;