import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProjectOpen from '../src/startScreen/ProjectOpen';
import * as platform from '../src/platform/files';

jest.mock('../src/platform/files', () => ({ selectProjectDirectory: jest.fn() }));

describe('ProjectOpen', () => {
    test('renders component', () => {
        const { container } = render(<ProjectOpen />, { wrapper: MemoryRouter });

        expect(container).toMatchSnapshot();
    });

    test('openDirectoryDialog should set selected directory to input', async () => {
        jest.mocked(platform.selectProjectDirectory).mockResolvedValueOnce('directory');

        render(<ProjectOpen />, { wrapper: MemoryRouter });

        const input = screen.getByLabelText('project-directory-input');

        fireEvent.click(input);

        await waitFor(() => expect(input).toHaveValue('directory'));
    });
});
