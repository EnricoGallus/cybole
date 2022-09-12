import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProjectOpen from '../src/startScreen/ProjectOpen';
import * as tauriApi from '@tauri-apps/api/dialog';

describe('ProjectOpen', () => {
    test('renders component', () => {
        const { container } = render(<ProjectOpen />, { wrapper: MemoryRouter });

        expect(container).toMatchSnapshot();
    });

    test('openDirectoryDialog should set selected directory to input', async () => {
        jest.spyOn(tauriApi, 'open').mockImplementationOnce(() => Promise.resolve('directory'));

        render(<ProjectOpen />, { wrapper: MemoryRouter });

        const input = screen.getByLabelText('project-directory-input');

        fireEvent.click(input);

        await waitFor(() => expect(input).toHaveValue('directory'));
    });
});
