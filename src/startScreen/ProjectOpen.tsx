import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '../utils/useForm';
import { open } from '@tauri-apps/api/dialog';
import {Fieldset} from "primereact/fieldset";
import {Button} from "primereact/button";
import {InputText} from "primereact/inputtext";

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
        onSubmit: () => navigate('/editor', { state: { directory: data.directory } }),
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
        <form className="registration-wrapper col-6" onSubmit={handleSubmit} noValidate>
            <Fieldset legend="Create Project">
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
                <Button type="submit" label="Create Project" className="mt-2" />
            </Fieldset>
        </form>
    );
};

export default ProjectOpen;
