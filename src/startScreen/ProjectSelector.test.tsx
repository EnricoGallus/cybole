import React from 'react';
import {render} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom'
import ProjectSelector from './ProjectSelector';

jest.mock("./ProjectOpen", () => () => {
    return <div data-testid="project-open"/>;
});

describe('ProjectSelector', function () {

    test('renders component', () => {
        var {container} = render(<ProjectSelector/>, {wrapper: MemoryRouter});

        expect(container).toMatchSnapshot()
    });
})
