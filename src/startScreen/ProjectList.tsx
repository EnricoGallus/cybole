import React from 'react';
import { Link } from 'react-router-dom';

const ProjectList = () => (
    <div>
        <div className="card">
            <h5>Projects</h5>
        </div>
        <div className="grid">
            <div className="col-12">
                <Link to="/projectNew" className="btn btn-primary">
                    New Project
                </Link>
            </div>
        </div>
    </div>
);

export default ProjectList;
