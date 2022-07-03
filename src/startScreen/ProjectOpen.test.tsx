import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProjectOpen from './ProjectOpen';
import {registerElectron} from "../tests/mocks";

describe('ProjectOpen', () => {
    test('renders component', () => {
        const { container } = render(<ProjectOpen />, { wrapper: MemoryRouter });

        expect(container).toMatchSnapshot();
    });

    test('openDirectoryDialog should set selected directory to input', async () => {
        let electronMock = registerElectron();
        render(<ProjectOpen />, { wrapper: MemoryRouter });

        const input = screen.getByLabelText('project-directory-input');

        fireEvent.click(input);

        await waitFor(() =>
            expect(electronMock.openDialog).toBeCalledWith('showOpenDialog', {
                title: 'Select the Directory of the project',
                buttonLabel: 'Select Directory',
                properties: ['openDirectory'],
            })
        );

        await waitFor(() => expect(input).toHaveValue('directory'));
    });
});
