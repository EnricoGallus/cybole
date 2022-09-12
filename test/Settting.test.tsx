import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Setting from '../src/startScreen/Setting';

describe('Setting', () => {
    test('renders component', () => {
        const { container } = render(<Setting />, {
            wrapper: MemoryRouter,
        });

        expect(container).toMatchSnapshot();
    });
});
