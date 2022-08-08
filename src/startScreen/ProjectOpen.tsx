import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fieldset, Input, Spacer, Text } from '@geist-ui/core';
import { useForm } from '../utils/useForm';
import { OpenDialogOptions} from "electron";
import React from 'react';

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

    const selectDirectory = () => {
        setDisableDirectory(true);
        const dialogConfig: OpenDialogOptions = {
            title: 'Select the Directory of the project',
            buttonLabel: 'Select Directory',
            properties: ['openDirectory'],
        };
        window.electron
            .openDialog(dialogConfig)
            .then((result) => {
                if (!result.canceled) {
                    setData({ ...data, directory: result.filePaths[0] as string });
                }
            })
            .catch((error) => {
                throw error;
            })
            .finally(() => setDisableDirectory(false));
    };

    return (
        <Fieldset width="100%">
            <form className="registration-wrapper" onSubmit={handleSubmit} noValidate>
                <Fieldset.Content>
                    <Fieldset.Title>Create Project</Fieldset.Title>
                    <Fieldset.Subtitle>Open an existing Directory as an Cybop Project</Fieldset.Subtitle>
                </Fieldset.Content>
                <Fieldset.Content>
                    <Input label="Project Name" value={data.name || ''} onChange={handleChange('name')} width="100%" />
                    {errors.name && (
                        <Text p type="error" className="error">
                            {errors.name}
                        </Text>
                    )}
                    <Spacer h={0.5} />
                    <Input
                        label="Project Directory"
                        aria-label="project-directory-input"
                        disabled={disableDirectory}
                        value={data.directory || ''}
                        readOnly
                        width="100%"
                        onClick={selectDirectory}
                    />
                    {errors.directory && (
                        <Text p type="error" className="error">
                            {errors.directory}
                        </Text>
                    )}
                </Fieldset.Content>
                <Fieldset.Footer>
                    <button type="submit">Create Project</button>
                </Fieldset.Footer>
            </form>
        </Fieldset>
    );
};

export default ProjectOpen;
