import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProjectList from './ProjectList';

describe('ProjectList', () => {
    test('renders component', () => {
        const { container } = render(<ProjectList />, {
            wrapper: MemoryRouter,
        });

        expect(container).toMatchSnapshot();
    });
});
