import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {Button, Grid, Input} from "@geist-ui/core";

function ProjectOpen() {
    const [directory, setDirectory] = useState('');
    const navigate = useNavigate();

    return (
        <Grid.Container>
            <Grid xs={24}>
                Project New
            </Grid>
            <Grid xs={24}>
                <Input value={directory} readOnly onClick={() => {
                    const dialogConfig = {
                        title: 'Select the Directory of the project',
                        buttonLabel: 'Select Directory',
                        properties: ['openDirectory']
                    };
                    window.electron.openDialog('showOpenDialog', dialogConfig)
                        .then((result: any) => setDirectory(result.filePaths[0]));
                }} />
                <Button onClick={() => {navigate('/editor', { state: { directory: directory}})}}>Open Project</Button>
            </Grid>
        </Grid.Container>
    )
}

export default ProjectOpen;