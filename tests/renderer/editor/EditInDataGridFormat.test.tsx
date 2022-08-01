import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EditInDataGridFormat from '_renderer/editor/EditInDataGridFormat';
import { registerElectron } from '_tests/mocks';

describe('EditInDataGridFormat', () => {
    test('renders component', () => {
        registerElectron();
        const { container } = render(
            <EditInDataGridFormat
                fileKey="test.xml"
                content='<node><node name="test" format="" /><node name="test2" /></node>'
            />,
            { wrapper: MemoryRouter }
        );

        expect(container).toMatchSnapshot();
    });
});
