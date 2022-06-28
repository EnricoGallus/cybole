import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom'
import ProjectOpen from './ProjectOpen';


describe('ProjectOpen', function () {

    test('renders component', () => {
        var {container} = render(<ProjectOpen/>, {wrapper: MemoryRouter});

        expect(container).toMatchSnapshot();
    });

    test('openDirectoryDialog should set selected directory to input', async function () {
        const electronMock = {
            openDialog: jest.fn().mockReturnValue(Promise.resolve({filePaths: ['directory']})),
            getFiles: jest.fn(),
            readFile: jest.fn()
        };

        window.electron = electronMock;

        render(<ProjectOpen/>, {wrapper: MemoryRouter});

        var input = screen.getByLabelText('project-directory-input');

        fireEvent.click(input);

        await waitFor(() => expect(electronMock.openDialog).toBeCalledWith('showOpenDialog', {
            title: 'Select the Directory of the project',
            buttonLabel: 'Select Directory',
            properties: ['openDirectory']
        }));

        await waitFor(() => expect(input).toHaveValue('directory'));
    });
})
