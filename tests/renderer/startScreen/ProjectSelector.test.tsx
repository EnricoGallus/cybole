import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProjectSelector from '_renderer/startScreen/ProjectSelector';
import { registerElectron } from '_tests/mocks';

describe('ProjectSelector', () => {
    test('renders component', () => {
        const electronMock = registerElectron();
        const { container } = render(<ProjectSelector children={<div data-testid="project-open" />} />, {
            wrapper: MemoryRouter,
        });

        expect(container).toMatchSnapshot();
        expect(electronMock.getAppDescription).toBeCalled();
    });
});
