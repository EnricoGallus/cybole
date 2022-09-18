import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '../utils/useForm';
import { open } from '@tauri-apps/api/dialog';
import {Button} from "primereact/button";
import {InputText} from "primereact/inputtext";
import {set} from "tauri-settings";

interface CreateProject {
    name: string;
    directory: string;
}

const ProjectOpen = () => {
    const [disableDirectory, setDisableDirectory] = useState(false);
    const navigate = useNavigate();

    const { handleSubmit, handleChange, data, errors, setData } = useForm<CreateProject>({
        validations: {
            name: {
                required: {
                    value: true,
                    message: 'You need to specify a name for the project',
                },
            },
            directory: {
                required: {
                    value: true,
                    message: 'Please select an existing directory.',
                },
            },
        },
        onSubmit: () => {navigate('/editor', { state: { name: data.name, path: data.directory } })},
    });

    const selectDirectory = async () => {
        setDisableDirectory(true);
        const selected = await open({
            directory: true,
            multiple: false,
        });

        if (selected !== null) {
            console.log(selected);
            setData({...data, directory: selected as string})
        }
    };

    return (
        <div className="grid">
            <div className="col-12">
                <h5>Open Directory and create new project</h5>
                <form className="formgroup-inline" onSubmit={handleSubmit} noValidate>
                    <div className="field">
                        <InputText
                            id="projectName"
                            placeholder="Project Name"
                            value={data.name || ''}
                            onChange={handleChange('name')}/>
                        {errors.name && (<small id="projectName-help" className="p-error block">{errors.name}</small>)}
                    </div>
                    <div className="field">
                        <InputText
                            id="projectDirectory"
                            placeholder="Project Directory"
                            aria-label="project-directory-input"
                            disabled={disableDirectory}
                            value={data.directory || ''}
                            readOnly
                            onClick={() => selectDirectory().finally(() => setDisableDirectory(false))}
                        />
                        {errors.directory && (<small id="projectDirectory-help" className="p-error block">{errors.directory}</small>)}
                    </div>
                    <Button type="submit" label="Create Project" />
                </form>
            </div>
        </div>
    );
};

export default ProjectOpen;
