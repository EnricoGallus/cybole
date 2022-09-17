import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EditInDataGridFormat from '../src/editor/EditInDataGridFormat';

describe('EditInDataGridFormat', () => {
    test('renders component', () => {
        let stateChanger = jest.fn();
        const { container } = render(
            <EditInDataGridFormat
                fileKey="test.xml"
                stateChanger={stateChanger}
                content='<node><node name="test" format="" /><node name="test2" /></node>'
            />,
            { wrapper: MemoryRouter }
        );

        expect(container).toMatchSnapshot();
    });
});
