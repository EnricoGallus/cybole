import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProjectOpen from '../src/startScreen/ProjectOpen';
import * as tauriApi from '@tauri-apps/api/dialog';

jest.mock('@tauri-apps/api/dialog', () => ({ open: jest.fn() }));

describe('ProjectOpen', () => {
    test('renders component', () => {
        const { container } = render(<ProjectOpen />, { wrapper: MemoryRouter });

        expect(container).toMatchSnapshot();
    });

    test('openDirectoryDialog should set selected directory to input', async () => {
        jest.mocked(tauriApi.open).mockResolvedValueOnce('directory');

        render(<ProjectOpen />, { wrapper: MemoryRouter });

        const input = screen.getByLabelText('project-directory-input');

        fireEvent.click(input);

        await waitFor(() => expect(input).toHaveValue('directory'));
    });
});
