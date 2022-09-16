import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProjectSelector from '../src/startScreen/ProjectSelector';

describe('ProjectSelector', () => {
    test('renders component', () => {
        const { container } = render(<ProjectSelector children={<div data-testid="project-open" />} />, {
            wrapper: MemoryRouter,
        });

        expect(container).toMatchSnapshot();
    });
});
