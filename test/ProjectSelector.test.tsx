import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StartScreen from '../src/startScreen/StartScreen';

describe('StartScreen', () => {
    test('renders component', () => {
        const { container } = render(<StartScreen children={<div data-testid="project-open" />} />, {
            wrapper: MemoryRouter,
        });

        expect(container).toMatchSnapshot();
    });
});
