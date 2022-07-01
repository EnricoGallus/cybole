import {Grid} from "@geist-ui/core";
import {Link} from "react-router-dom";

const ProjectList = () => (
        <Grid.Container>
            <Grid xs={24}>
                <p className="display-1">Projects</p>
            </Grid>
            <Grid xs={24}>
                <Link to="/projectNew" className="btn btn-primary">New Project</Link>
            </Grid>

        </Grid.Container>
    )

export default ProjectList;