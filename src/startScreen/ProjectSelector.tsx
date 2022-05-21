import React from 'react';
import './ProjectSelector.css';
import {Link} from "react-router-dom";
import { Grid } from '@geist-ui/core';
import ProjectOpen from "./ProjectOpen";

function ProjectSelector() {
    return (
        <Grid.Container gap={2}>
            <Grid xs={24}>
                <ProjectOpen/>
            </Grid>
            <Grid xs={24}>
                <Link to="/settings" className="btn btn-primary">To Settings</Link>
            </Grid>
            {/*<Grid>
                <ProjectList/>
            </Grid>*/}
        </Grid.Container>
    );
}

export default ProjectSelector;
