import React, {useEffect, useState} from 'react';
import persister from "../utils/persister";
import {DataScroller} from "primereact/datascroller";
import {Button} from "primereact/button";
import {useNavigate} from "react-router-dom";

import './ProjectList.css'

const ProjectList = () => {
    const [projects, setProjects] = useState<ProjectSchema[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        persister.get().get('projects')
            .catch(r => console.log(r))
            .then(p => setProjects(p as ProjectSchema[]));
    }, [projects]);

    const openProject = (data: ProjectSchema) => {
        navigate('/editor', {state: {name: data.name, path: data.path}})
    }

    const removeProject = (projectName: string) => {
        let changeProjects = projects.filter((s: ProjectSchema) => s.name != projectName)
        persister.get().set('projects', changeProjects)
    }

    const projectTemplate = (data: ProjectSchema) => {
        return (
            <div className="project">
                <a className="project-detail" onClick={() => openProject(data)}>
                    <div className="project-name" >{data.name}</div>
                    <div className="project-path"><small>{data.path}</small></div>
                </a>
                <div className="project-action">
                    <Button label="Delete" onClick={() => removeProject(data.name)}></Button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="card">
                <h5>Recent Projects</h5>
            </div>
            <div className="grid">
                <div className="col-12">
                    <div className="card">
                        <DataScroller value={projects} itemTemplate={projectTemplate} rows={10} inline scrollHeight="500px" />
                    </div>
                </div>
            </div>
        </div>);
};

export default ProjectList;
