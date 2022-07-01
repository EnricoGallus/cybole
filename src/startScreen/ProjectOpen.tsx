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
                <Input aria-label="project-directory-input" value={directory} readOnly onClick={() => {
                    let dialogConfig = {
                        title: 'Select the Directory of the project',
                        buttonLabel: 'Select Directory',
                        properties: ['openDirectory']
                    };
                    window.electron.openDialog('showOpenDialog', dialogConfig)
                        .then(result => setDirectory(result.filePaths[0]));
                }} />
                <Button onClick={() => {navigate('/editor', { state: { directory: directory}})}}>Open Project</Button>
            </Grid>
        </Grid.Container>
    )
}

export default ProjectOpen;